import React from "react";
import styles from "./MyDesign.module.scss";

const MyDesign = () => (
  <div className={styles.container}>
    <div
      className={styles.shape1}
      style={{
        position: "absolute",
        left: "281.96875px",
        top: "173px",
        width: "773px",
        height: "394px",
        backgroundColor: "red",
      }}
    ></div>

    <div
      className={styles.shape2}
      style={{
        position: "absolute",
        left: "486.96875px",
        top: "331px",
        width: "100px",
        height: "100px",
        backgroundColor: "blue",
      }}
    ></div>
  </div>
);

export default MyDesign;
