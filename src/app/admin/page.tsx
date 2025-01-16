import React from "react";
import { IconPhoto } from "@tabler/icons-react";

const UploadPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.uploadBox}>
        <h2 style={styles.title}>Upload your File:</h2>
        <div style={styles.dropZone}>
          <IconPhoto
            size={50}
            color="#007bff"
            style={{ marginBottom: "10px" }}
          />
          <p style={styles.text}>Drag & Drop</p>
          <p style={styles.browseText}>
            or <span style={styles.browseLink}>browse</span>
          </p>
          <p style={styles.supportText}>Supports: JPEG, JPG, PNG</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#1a1a1a",
  },
  uploadBox: {
    position: "relative" as const,
    textAlign: "center" as const,
    padding: "20px",
    width: "600px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
  title: {
    position: "absolute" as const,
    left: "20px",
    fontSize: "16px",
    color: "#333333",
  },
  dropZone: {
    marginTop: "30px",
    height: "350px",
    border: "2px dashed #aac4e8",
    borderRadius: "10px",
    backgroundColor: "#f9fbff",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: "16px",
    fontWeight: "bold" as const,
    color: "#333333",
    marginBottom: "5px",
  },
  browseText: {
    fontSize: "14px",
    color: "#333333",
    marginBottom: "5px",
  },
  browseLink: {
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
  },
  supportText: {
    fontSize: "12px",
    color: "#666666",
  },
};

export default UploadPage;
