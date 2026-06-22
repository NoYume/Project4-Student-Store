import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="NotFound">
      <div className="cta">
        <h1>404</h1>
        <p>That page does not exist</p>
        <Link to="/store" className="back-link">
          Back to Store
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
