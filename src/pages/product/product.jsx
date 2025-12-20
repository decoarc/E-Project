import { useParams } from "react-router-dom";

export default function Product() {
  const { id } = useParams();
  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1>Product: {id}</h1>
    </div>
  );
}
