import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#3F92FF",
    padding: "3px 7px",
    borderRadius: 10,
    marginRight: 20
  },
  count: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#FFFFFF"
  },
}));

const UnreadCount = (props) => {
  const classes = useStyles();

  const { unreadMessageCount } = props;

  return (
    <Box className={classes.root}>
      <Typography className={classes.count}>
        {unreadMessageCount}
      </Typography>
    </Box>
  );
};

export default UnreadCount;