const CardTitle: React.FC<{title: string}> = ({title}) => {
  return (
    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
      {title}
    </h5>
  );
};

export default CardTitle;
