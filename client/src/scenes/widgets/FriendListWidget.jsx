import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";
import { useApi } from "api";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { Bone } from "components/Skeleton";

const FriendListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const api = useApi();
  const me = useSelector((state) => state.user);
  const isMe = me._id === userId;
  // Only *your* list lives in Redux; someone else's list must not overwrite it.
  const [otherFriends, setOtherFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  // When you add/remove this person, their circle changes too — refetch it.
  const myFriendCount = isMe ? 0 : (me.friends || []).length;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api(`/users/${userId}/friends`)
      .then((data) => {
        if (!alive) return;
        if (isMe) dispatch(setFriends({ friends: data }));
        else setOtherFriends(data);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [userId, isMe, api, dispatch, myFriendCount]);

  const friends = (isMe ? me.friends : otherFriends).filter((f) => f && f._id);

  return (
    <WidgetWrapper data-testid="friend-list">
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "text.primary" }}>
          {isMe ? "Your circle" : "Circle"}
        </Typography>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          {friends.length}
        </Typography>
      </Box>

      {loading && friends.length === 0 ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Bone w={44} h={44} r={22} />
              <Box sx={{ flex: 1 }}>
                <Bone w="55%" h={11} sx={{ mb: 0.8 }} />
                <Bone w="35%" h={9} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : friends.length === 0 ? (
        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
          {isMe ? "No friends yet. Find people with search, or add someone from the feed." : "No friends to show yet."}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
          <AnimatePresence initial={false}>
            {friends.map((f) => (
              <motion.div
                key={f._id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Friend friendId={f._id} name={`${f.firstName} ${f.lastName}`} subtitle={f.occupation} userPicturePath={f.picturePath} size="44px" />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default FriendListWidget;
