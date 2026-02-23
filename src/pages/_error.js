function Error({ statusCode }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1.5rem", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {statusCode ? `Error ${statusCode}` : "An error occurred"}
      </h1>
      <p style={{ color: "#666" }}>
        {statusCode === 404
          ? "The page you are looking for does not exist."
          : "An unexpected error occurred."}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
