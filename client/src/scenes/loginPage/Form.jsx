import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternateOutlined,
  CloseRounded,
  ErrorOutlineRounded,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Dropzone from "react-dropzone";
import { setLogin } from "state";
import { request } from "api";
import { useToast } from "components/Toast";
import FilePreview from "components/FilePreview";
import { ease, spring } from "components/motion";

const IMAGE_TYPES = { "image/jpeg": [], "image/png": [], "image/webp": [] };

const registerSchema = yup.object().shape({
  firstName: yup.string().trim().required("Required"),
  lastName: yup.string().trim().required("Required"),
  email: yup.string().email("Enter a valid email").required("Required"),
  password: yup.string().min(5, "At least 5 characters").required("Required"),
  location: yup.string().trim().required("Required"),
  occupation: yup.string().trim().required("Required"),
  picture: yup.mixed().nullable(),
});

const loginSchema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Required"),
  password: yup.string().required("Required"),
});

const emptyRegister = { firstName: "", lastName: "", email: "", password: "", location: "", occupation: "", picture: null };

const fieldAnim = {
  hidden: { opacity: 0, y: 10 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.35, ease } }),
};

const Field = ({ i, span = 2, formik, name, label, type = "text", ...rest }) => {
  const { values, errors, touched, handleBlur, handleChange } = formik;
  return (
    <Box component={motion.div} variants={fieldAnim} custom={i} initial="hidden" animate="show" sx={{ gridColumn: { xs: "span 2", sm: `span ${span}` } }}>
      <TextField
        fullWidth
        label={label}
        name={name}
        type={type}
        value={values[name]}
        onBlur={handleBlur}
        onChange={handleChange}
        error={Boolean(touched[name]) && Boolean(errors[name])}
        helperText={touched[name] && errors[name]}
        inputProps={{ "data-testid": `field-${name}` }}
        {...rest}
      />
    </Box>
  );
};

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [prefillEmail, setPrefillEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const isLogin = pageType === "login";

  const switchTo = (type) => {
    setServerError("");
    setPageType(type);
  };

  const register = async (values) => {
    const formData = new FormData();
    ["firstName", "lastName", "email", "password", "location", "occupation"].forEach((k) =>
      formData.append(k, values[k].trim ? values[k].trim() : values[k])
    );
    if (values.picture) formData.append("picture", values.picture);
    await request("/auth/register", { method: "POST", body: formData });
    toast("Welcome aboard — please sign in");
    setPrefillEmail(values.email);
    switchTo("login");
  };

  const login = async (values) => {
    const data = await request("/auth/login", { method: "POST", json: values });
    dispatch(setLogin({ user: data.user, token: data.token }));
    navigate("/home");
  };

  const handleFormSubmit = async (values) => {
    setServerError("");
    try {
      if (isLogin) await login(values);
      else await register(values);
    } catch (err) {
      setServerError(err.message);
    }
  };

  const pwAdornment = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton size="small" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"}>
          {showPw ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
        </IconButton>
      </InputAdornment>
    ),
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease, delay: 0.15 } }}
      className="glass"
      sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: "28px", boxShadow: (t) => t.palette.glass.shadow }}
    >
      {/* Segmented control with a sliding liquid pill */}
      <Box
        role="tablist"
        sx={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          p: 0.5,
          mb: 3.5,
          borderRadius: 999,
          bgcolor: "neutral.light",
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box
          component={motion.span}
          aria-hidden="true"
          initial={false}
          animate={{ x: isLogin ? "0%" : "100%" }}
          transition={spring}
          sx={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: 4,
            width: "calc(50% - 4px)",
            borderRadius: 999,
            bgcolor: "primary.main",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 6px 18px -8px rgba(0,0,0,.45)",
          }}
        />
        {[
          ["login", "Sign in"],
          ["register", "Create account"],
        ].map(([key, label]) => (
          <Box
            key={key}
            role="tab"
            aria-selected={pageType === key}
            data-testid={`tab-${key}`}
            onClick={() => switchTo(key)}
            sx={{
              position: "relative",
              textAlign: "center",
              py: 1.1,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              color: pageType === key ? "primary.contrastText" : "text.secondary",
              transition: "color .3s",
            }}
          >
            {label}
          </Box>
        ))}
      </Box>

      {/* Remount on switch so the new form slides in (no nested exit presence,
          which would hold up the page-level route transition). */}
      <motion.div
          key={pageType}
          initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease } }}
        >
          <Typography variant="h3" sx={{ color: "text.primary", mb: 0.5 }}>
            {isLogin ? "Welcome back" : "Join the register"}
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            {isLogin ? "Sign in to continue to your circle." : "A few details and you're in."}
          </Typography>

          <Formik
            onSubmit={handleFormSubmit}
            initialValues={isLogin ? { email: prefillEmail, password: "" } : emptyRegister}
            validationSchema={isLogin ? loginSchema : registerSchema}
          >
            {(formik) => {
              const { values, handleSubmit, setFieldValue, isSubmitting } = formik;
              return (
                <form onSubmit={handleSubmit} noValidate>
                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    {!isLogin && (
                      <>
                        <Field i={0} span={1} formik={formik} name="firstName" label="First name" autoComplete="given-name" />
                        <Field i={1} span={1} formik={formik} name="lastName" label="Last name" autoComplete="family-name" />
                        <Field i={2} span={1} formik={formik} name="location" label="Location" />
                        <Field i={3} span={1} formik={formik} name="occupation" label="Occupation" />
                        <Box component={motion.div} variants={fieldAnim} custom={4} initial="hidden" animate="show" sx={{ gridColumn: "span 2" }}>
                          <Dropzone
                            accept={IMAGE_TYPES}
                            maxSize={5 * 1024 * 1024}
                            multiple={false}
                            onDrop={(files) => files[0] && setFieldValue("picture", files[0])}
                            onDropRejected={() => toast("Use a JPG, PNG or WEBP under 5MB", "error")}
                          >
                            {({ getRootProps, getInputProps, isDragActive }) => (
                              <Box
                                {...getRootProps()}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  p: 1.5,
                                  borderRadius: "14px",
                                  cursor: "pointer",
                                  border: (t) => `1.5px dashed ${isDragActive ? t.palette.accent.main : t.palette.divider}`,
                                  bgcolor: isDragActive ? "primary.light" : "transparent",
                                  transition: "all .25s",
                                  "&:hover": { borderColor: "accent.main" },
                                }}
                              >
                                <input {...getInputProps()} data-testid="register-picture" />
                                <Box
                                  sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "neutral.light",
                                    color: "accent.main",
                                    flexShrink: 0,
                                  }}
                                >
                                  {values.picture ? (
                                    <FilePreview file={values.picture} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    <AddPhotoAlternateOutlined />
                                  )}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="h6" noWrap sx={{ color: "text.primary" }}>
                                    {values.picture ? values.picture.name : "Add a portrait"}
                                  </Typography>
                                  <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                                    {isDragActive ? "Drop it here" : "Optional · drag & drop or click"}
                                  </Typography>
                                </Box>
                                {values.picture && (
                                  <IconButton
                                    size="small"
                                    aria-label="Remove picture"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFieldValue("picture", null);
                                    }}
                                  >
                                    <CloseRounded fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            )}
                          </Dropzone>
                        </Box>
                      </>
                    )}
                    <Field i={isLogin ? 0 : 5} formik={formik} name="email" label="Email" type="email" autoComplete="email" />
                    <Field
                      i={isLogin ? 1 : 6}
                      formik={formik}
                      name="password"
                      label="Password"
                      type={showPw ? "text" : "password"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      InputProps={pwAdornment}
                    />
                  </Box>

                  <AnimatePresence>
                    {serverError && (
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16, x: [0, -6, 6, -3, 3, 0] }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.4 }}
                        data-testid="form-error"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.5,
                          py: 1,
                          borderRadius: "12px",
                          color: "error.main",
                          bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(181,90,103,0.12)" : "rgba(123,35,52,0.07)"),
                          fontSize: 13,
                          fontWeight: 500,
                          overflow: "hidden",
                        }}
                      >
                        <ErrorOutlineRounded fontSize="small" /> {serverError}
                      </Box>
                    )}
                  </AnimatePresence>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    className="shine"
                    data-testid="submit"
                    sx={{ mt: 3, py: 1.5, fontSize: 14 }}
                  >
                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : isLogin ? "Sign in" : "Create account"}
                  </Button>

                  <Typography sx={{ mt: 2.5, textAlign: "center", color: "text.secondary", fontSize: 13 }}>
                    {isLogin ? "New here? " : "Already a member? "}
                    <Box
                      component="button"
                      type="button"
                      onClick={() => switchTo(isLogin ? "register" : "login")}
                      sx={{
                        background: "none",
                        border: 0,
                        p: 0,
                        font: "inherit",
                        cursor: "pointer",
                        color: "accent.main",
                        fontWeight: 600,
                        backgroundImage: "linear-gradient(currentColor, currentColor)",
                        backgroundSize: "0% 1px",
                        backgroundPosition: "0 100%",
                        backgroundRepeat: "no-repeat",
                        transition: "background-size .3s",
                        "&:hover": { backgroundSize: "100% 1px" },
                      }}
                    >
                      {isLogin ? "Create an account" : "Sign in"}
                    </Box>
                  </Typography>
                </form>
              );
            }}
          </Formik>
        </motion.div>
    </Box>
  );
};

export default Form;
