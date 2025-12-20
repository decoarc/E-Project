import { useParams } from "react-router-dom";

export default function Category() {
  const { slug } = useParams();
  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1>Category: {slug}</h1>
    </div>
  );
}
