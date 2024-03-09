import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Movie = () => {
  const [movie, setMovie] = useState({});
  let { id } = useParams();

  useEffect(() => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const requestOptions = {
      method: "GET",
      header: headers,
    };
    fetch(`http://localhost:8080/movies/${id}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setMovie(data);
      });
  }, [id]);

  return (
    <div>
      <h2>Movie: {movie.title}</h2>
      <small>
        <em>
          Released: {movie.release_date}
          <br />
          Duration: {movie.runtime} minutes
          <br />
          Rated: {movie.mpaa_rating}
        </em>
      </small>
      <hr />
      {movie.description}
    </div>
  );
};

export default Movie;
