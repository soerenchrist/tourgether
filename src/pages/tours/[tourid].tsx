import LayoutBase from "@/components/layout/layoutBase";
import { useRouter } from "next/router";

const Tour = () => {
  const router = useRouter();
  const { tourid } = router.query;

  return <LayoutBase>
      <h1 className="text-xl">{tourid}</h1>
    </LayoutBase>
}

export default Tour;