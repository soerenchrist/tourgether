const ProgressBar = () => {
  return (
    <div className="w-full">
      <div className="h-2 bg-blue-200 w-full overflow-hidden rounded-md">
        <div
          className="w-full h-full bg-blue-500"
          style={{
            animation: "indeterminateAnimation 1s infinite linear",
            transformOrigin: "0% 50%",
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
