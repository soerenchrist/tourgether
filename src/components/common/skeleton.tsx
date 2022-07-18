
type ComponentProps = React.ComponentProps<'div'>;

const Skeleton: React.FC<ComponentProps> = (props) => {
  return (
    <div className={`bg-gray-300 animate-pulse rounded-md ${props.className ?? ""}`}></div>
  )
}

export default Skeleton;