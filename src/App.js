import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Alert from "./components/Alert";

function App() {
  const [jwtToken, setJwtToken] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertClassName, setAlertClassName] = useState("d-none");

  const navigate = useNavigate();

  const logOut = () => {
    console.log("Logging out");
    const requestOptions = {
      method: "GET",
      credentials: "include",
    };
    fetch("http://localhost:8080/logout", requestOptions)
      .catch((error) => {
        console.log("error logging out", error);
      })
      .finally(() => {
        setJwtToken("");
      });
    navigate("/login");
  };

  useEffect(() => {
    if (jwtToken === "") {
      console.log("No token set, fetching token");
      const requestOptions = {
        method: "GET",
        credentials: "include",
      };
      fetch("http://localhost:8080/refresh", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            setJwtToken(data.access_token);
            console.log("JWT Token: ", data.access_token);
          }
        })
        .catch((error) => {
          console.log("could not refresh token ", error);
        });
    }
  }, [jwtToken]);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1 className="mt-3"> Go Watch a Movie</h1>
        </div>
        <div className="col text-end">
          {jwtToken === "" ? (
            <Link to="/login">
              <span className="badge bg-success">Login</span>
            </Link>
          ) : (
            <a href="#!" onClick={logOut}>
              <span className="badge bg-danger">Logout</span>
            </a>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-md-2">
          <nav>
            <div className="list-group">
              <Link to="/" className="list-group-item list-group-item-action">
                Home
              </Link>
              <Link
                to="/movies"
                className="list-group-item list-group-item-action"
              >
                Movies
              </Link>
              <Link
                to="/genres"
                className="list-group-item list-group-item-action"
              >
                Genres
              </Link>
              {jwtToken !== "" && (
                <>
                  <Link
                    to="/admin/movie/0"
                    className="list-group-item list-group-item-action"
                  >
                    Add Movie
                  </Link>
                  <Link
                    to="/manage-catalogue"
                    className="list-group-item list-group-item-action"
                  >
                    Manage Catalogue
                  </Link>
                  <Link
                    to="/graphql"
                    className="list-group-item list-group-item-action"
                  >
                    GraphQL
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
        <div className="col-md-10">
          <Alert message={alertMessage} className={alertClassName} />
          <Outlet
            context={{
              jwtToken,
              setJwtToken,
              setAlertMessage,
              setAlertClassName,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
