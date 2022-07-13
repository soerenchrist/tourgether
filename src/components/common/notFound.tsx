const NotFound: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="h-96 w-full flex gap-4 pt-12 flex-col items-center">
      <span className="text-5xl font-bold">404</span>
      <span className="text-3xl">
        {message || "The resource was not found!"}
      </span>
    </div>
  );
};

export default NotFound;
