const PaginationText: React.FC<{ from: number; to: number; total: number }> = ({
  from,
  to,
  total,
}) => {
  return (
    <span className="text-sm">
      Showing items <b>{from}</b> to <b>{to}</b> of {total}
    </span>
  );
};

export default PaginationText;
