import StarEmptyIconSvg from "./stars/StarEmptyIconSvg";
import StarFilledIconSvg from "./stars/StarFilledIconSvg";

const Stars = ({ rating }) => {
  let stars: any[] = [];

  stars = Array.from({ length: 5 }, (_, i) => i + 1).map((i) => {
    if (i <= rating) {
      return <StarFilledIconSvg size={24} key={i} />;
    } else {
      return <StarEmptyIconSvg size={24} key={i} />;
    }
  });

  return (
    <div style={{ display: "flex", margin: "0 -4px" }}>
      {stars.map((star) => star)}
    </div>
  );
};

export default Stars;
