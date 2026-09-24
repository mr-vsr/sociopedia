/* End-to-end API tests. Run against a live server:
     API_URL=http://localhost:3001 npm test
   Uses unique emails so it can run against a dev database repeatedly. */
import { test } from "node:test";
import assert from "node:assert/strict";

const API = process.env.API_URL || "http://localhost:3001";
const uid = Date.now().toString(36);
// 1x1 transparent PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

const call = async (method, path, { token, json, form } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) body = form;
  const res = await fetch(`${API}${path}`, { method, headers, body });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
};

const registerForm = (overrides = {}, withPicture = true) => {
  const f = new FormData();
  const v = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: `ada.${uid}@test.dev`,
    password: "secret123",
    location: "London",
    occupation: "Mathematician",
    ...overrides,
  };
  for (const [k, val] of Object.entries(v)) f.append(k, val);
  if (withPicture) f.append("picture", new Blob([PNG], { type: "image/png" }), "../../evil.png");
  return f;
};

const ctx = {};

test("health", async () => {
  const r = await call("GET", "/health");
  assert.equal(r.status, 200);
  assert.equal(r.data.db, true);
});

test("register: validation, upload, no password leak, duplicate", async () => {
  let r = await call("POST", "/auth/register", { form: registerForm({ email: "" }) });
  assert.equal(r.status, 400);

  r = await call("POST", "/auth/register", { form: registerForm({ email: "nope" }) });
  assert.equal(r.status, 400);

  r = await call("POST", "/auth/register", { form: registerForm({ password: "123" }) });
  assert.equal(r.status, 400);

  const bad = registerForm({}, false);
  bad.append("picture", new Blob(["hello"], { type: "text/plain" }), "a.txt");
  r = await call("POST", "/auth/register", { form: bad });
  assert.equal(r.status, 400);
  assert.match(r.data.message, /images/i);

  r = await call("POST", "/auth/register", { form: registerForm() });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.equal(r.data.password, undefined, "password hash must not be returned");
  assert.match(r.data.picturePath, /^\d+-[a-f0-9]{12}\.png$/, "filename is server-generated");
  ctx.a = r.data;

  const img = await fetch(`${API}/assets/${r.data.picturePath}`);
  assert.equal(img.status, 200);

  r = await call("POST", "/auth/register", {
    form: registerForm({ email: `ADA.${uid}@TEST.dev` }),
  });
  assert.equal(r.status, 409, "duplicate email (case-insensitive)");

  r = await call("POST", "/auth/register", {
    form: registerForm({ firstName: "Bob", lastName: "Byron", email: `bob.${uid}@test.dev` }, false),
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.picturePath, "");
  ctx.b = r.data;
});

test("login", async () => {
  let r = await call("POST", "/auth/login", { json: {} });
  assert.equal(r.status, 400);
  r = await call("POST", "/auth/login", { json: { email: `ada.${uid}@test.dev`, password: "wrong" } });
  assert.equal(r.status, 400);
  r = await call("POST", "/auth/login", { json: { email: `nobody.${uid}@test.dev`, password: "x" } });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Invalid email or password");

  r = await call("POST", "/auth/login", { json: { email: `Ada.${uid}@test.dev`, password: "secret123" } });
  assert.equal(r.status, 200);
  assert.ok(r.data.token);
  assert.equal(r.data.user.password, undefined);
  ctx.ta = r.data.token;

  r = await call("POST", "/auth/login", { json: { email: `bob.${uid}@test.dev`, password: "secret123" } });
  ctx.tb = r.data.token;
});

test("auth middleware", async () => {
  let r = await call("GET", "/posts");
  assert.equal(r.status, 401);
  r = await call("GET", "/posts", { token: "garbage" });
  assert.equal(r.status, 401);
  r = await call("GET", "/nope", { token: ctx.ta });
  assert.equal(r.status, 404);
});

test("users: get, 404s, search", async () => {
  let r = await call("GET", `/users/${ctx.a._id}`, { token: ctx.tb });
  assert.equal(r.status, 200);
  assert.equal(r.data.firstName, "Ada");
  assert.equal(r.data.password, undefined);

  r = await call("GET", `/users/not-an-id`, { token: ctx.ta });
  assert.equal(r.status, 404);
  r = await call("GET", `/users/507f1f77bcf86cd799439011`, { token: ctx.ta });
  assert.equal(r.status, 404);

  r = await call("GET", `/users/search?q=lovel`, { token: ctx.tb });
  assert.equal(r.status, 200);
  assert.ok(r.data.some((u) => u._id === ctx.a._id));
  assert.ok(r.data.every((u) => u.password === undefined && u.email === undefined));

  r = await call("GET", `/users/search?q=${encodeURIComponent(".*(")}`, { token: ctx.tb });
  assert.equal(r.status, 200, "regex characters are escaped");
  r = await call("GET", `/users/search`, { token: ctx.tb });
  assert.deepEqual(r.data, []);
});

test("friends: add, both sides, ownership, remove keeps others", async () => {
  // C befriends A too, so we can check A's list survives B unfriending A
  const rc = await call("POST", "/auth/register", {
    form: registerForm({ firstName: "Cy", lastName: "Cole", email: `cy.${uid}@test.dev` }, false),
  });
  ctx.c = rc.data;
  const tc = (await call("POST", "/auth/login", { json: { email: `cy.${uid}@test.dev`, password: "secret123" } })).data.token;

  let r = await call("PATCH", `/users/${ctx.b._id}/${ctx.a._id}`, { token: ctx.tb });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.map((f) => f._id), [ctx.a._id]);
  assert.equal(r.data[0].password, undefined);

  await call("PATCH", `/users/${ctx.c._id}/${ctx.a._id}`, { token: tc });

  r = await call("GET", `/users/${ctx.a._id}/friends`, { token: ctx.ta });
  assert.deepEqual(r.data.map((f) => f._id).sort(), [ctx.b._id, ctx.c._id].sort());

  r = await call("PATCH", `/users/${ctx.a._id}/${ctx.b._id}`, { token: ctx.tb });
  assert.equal(r.status, 403, "cannot edit someone else's friends");

  r = await call("PATCH", `/users/${ctx.b._id}/${ctx.b._id}`, { token: ctx.tb });
  assert.equal(r.status, 400);

  r = await call("PATCH", `/users/${ctx.b._id}/507f1f77bcf86cd799439011`, { token: ctx.tb });
  assert.equal(r.status, 404);

  // B removes A. A must still have C (old bug wiped A's whole list).
  r = await call("PATCH", `/users/${ctx.b._id}/${ctx.a._id}`, { token: ctx.tb });
  assert.deepEqual(r.data, []);
  r = await call("GET", `/users/${ctx.a._id}/friends`, { token: ctx.ta });
  assert.deepEqual(r.data.map((f) => f._id), [ctx.c._id]);
});

test("posts: create, feed order, user posts", async () => {
  let r = await call("POST", "/posts", { token: ctx.ta, form: new FormData() });
  assert.equal(r.status, 400, "empty post rejected");

  const f1 = new FormData();
  f1.append("description", "First post");
  f1.append("userId", ctx.b._id); // spoof attempt must be ignored
  r = await call("POST", "/posts", { token: ctx.ta, form: f1 });
  assert.equal(r.status, 201);
  const mine = r.data.find((p) => p.description === "First post");
  assert.equal(mine.userId, ctx.a._id, "author comes from the token");

  const f2 = new FormData();
  f2.append("description", "With image");
  f2.append("picture", new Blob([PNG], { type: "image/png" }), "photo.png");
  r = await call("POST", "/posts", { token: ctx.ta, form: f2 });
  assert.equal(r.status, 201);
  assert.equal(r.data[0].description, "With image", "newest first");
  assert.match(r.data[0].picturePath, /^\d+-[a-f0-9]{12}\.png$/);
  ctx.post = r.data[0];

  r = await call("GET", "/posts", { token: ctx.tb });
  assert.equal(r.status, 200);
  const times = r.data.map((p) => new Date(p.createdAt).getTime());
  assert.deepEqual(times, [...times].sort((a, b) => b - a));

  r = await call("GET", `/posts/${ctx.a._id}/posts`, { token: ctx.tb });
  assert.equal(r.data.length, 2);
  assert.ok(r.data.every((p) => p.userId === ctx.a._id));
});

test("posts: like toggle uses token identity", async () => {
  let r = await call("PATCH", `/posts/${ctx.post._id}/like`, {
    token: ctx.tb,
    json: { userId: ctx.a._id },
  });
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.data.likes), [ctx.b._id]);

  r = await call("PATCH", `/posts/${ctx.post._id}/like`, { token: ctx.tb, json: {} });
  assert.deepEqual(r.data.likes, {});

  r = await call("PATCH", `/posts/not-an-id/like`, { token: ctx.tb, json: {} });
  assert.equal(r.status, 404);
});

test("posts: comments", async () => {
  let r = await call("POST", `/posts/${ctx.post._id}/comments`, { token: ctx.tb, json: { text: "  " } });
  assert.equal(r.status, 400);
  r = await call("POST", `/posts/${ctx.post._id}/comments`, { token: ctx.tb, json: { text: "x".repeat(501) } });
  assert.equal(r.status, 400);
  r = await call("POST", `/posts/${ctx.post._id}/comments`, { token: ctx.tb, json: { text: "Lovely" } });
  assert.equal(r.status, 201);
  const c = r.data.comments.at(-1);
  assert.equal(c.text, "Lovely");
  assert.equal(c.userId, ctx.b._id);
  assert.equal(c.name, "Bob Byron");
  r = await call("POST", `/posts/507f1f77bcf86cd799439011/comments`, { token: ctx.tb, json: { text: "hi" } });
  assert.equal(r.status, 404);
});

test("posts: delete is owner-only and removes the upload", async () => {
  let r = await call("DELETE", `/posts/${ctx.post._id}`, { token: ctx.tb });
  assert.equal(r.status, 403);
  r = await call("DELETE", `/posts/${ctx.post._id}`, { token: ctx.ta });
  assert.equal(r.status, 200);
  r = await call("GET", `/posts/${ctx.a._id}/posts`, { token: ctx.ta });
  assert.equal(r.data.length, 1);
  await new Promise((res) => setTimeout(res, 100));
  const img = await fetch(`${API}/assets/${ctx.post.picturePath}`);
  assert.equal(img.status, 404);
  r = await call("DELETE", `/posts/${ctx.post._id}`, { token: ctx.ta });
  assert.equal(r.status, 404);
});

test("malformed JSON returns 400", async () => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad",
  });
  assert.equal(res.status, 400);
});

test("upload too large returns 400", async () => {
  const f = new FormData();
  f.append("description", "big");
  f.append("picture", new Blob([Buffer.alloc(6 * 1024 * 1024)], { type: "image/png" }), "big.png");
  const r = await call("POST", "/posts", { token: ctx.ta, form: f });
  assert.equal(r.status, 400);
  assert.match(r.data.message, /5MB/);
});
