import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Input from "./form/Input";
import Select from "./form/Select";
import TextArea from "./form/TextArea";
import Checkbox from "./form/Checkbox";
import Swal from "sweetalert2";

const EditMovie = () => {
  const navigate = useNavigate();
  const { jwtToken } = useOutletContext();

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [movie, setMovie] = useState({
    id: 0,
    title: "",
    release_date: "",
    runtime: "",
    mpaa_rating: "",
    description: "",
    genres: [],
    genres_array: [Array(13).fill(false)],
  });

  const mpaaOptions = [
    { id: "G", value: "G" },
    { id: "PG", value: "PG" },
    { id: "PG13", value: "PG13" },
    { id: "R", value: "R" },
    { id: "NC17", value: "NC17" },
    { id: "18A", value: "18A" },
  ];

  const hasError = (key) => {
    return errors.indexOf(key) !== -1;
  };

  // get id from the URL
  let { id } = useParams();
  if (id === undefined) {
    id = 0;
  }

  useEffect(() => {
    if (jwtToken === "") {
      navigate("/login");
      return;
    }

    if (id === 0) {
      // adding a movie
      setMovie({
        id: 0,
        title: "",
        release_date: "",
        runtime: "",
        mpaa_rating: "",
        description: "",
        genres: [],
        genres_array: [Array(13).fill(false)],
      });

      const headers = new Headers();
      headers.append("Content-Type", "application/json");

      const requestOptions = { method: "GET", headers: headers };
      fetch(`http://localhost:8080/genres`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          let checks = [];
          data.forEach((g) => {
            checks.push({ id: g.id, checked: false, genre: g.genre });
          });
          setMovie((m) => ({
            ...m,
            genres: checks,
            genres_array: [],
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // editing an existing movie
    }
  }, [id, jwtToken, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    let errors = [];
    let required = [
      {
        field: movie.title,
        name: "title",
      },
      {
        field: movie.release_date,
        name: "release_date",
      },
      {
        field: movie.runtime,
        name: "runtime",
      },
      {
        field: movie.description,
        name: "description",
      },
      {
        field: movie.mpaa_rating,
        name: "mpaa_rating",
      },
    ];

    required.forEach(function (obj) {
      if (obj.field === "") {
        errors.push(obj.name);
      }
    });

    if (movie.genres_array.length === 0) {
      Swal.fire({
        title: "Error",
        text: "You must at least choose one genre",
        icon: "error",
        width: 400,
        confirmButtonText: "Ok",
      });
      errors.push("genres");
    }

    setErrors(errors);

    console.log("'Errors: '", errors);

    if (errors.length > 0) {
      return false;
    }

    // passed validation, so save changes
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + jwtToken);

    // assume we are adding a new movie
    let method = "PUT";

    if (movie.id > 0) {
      method = "PATCH";
    }

    const requestBody = movie;
    // we need to convert the values in JSON for relase date (to date)
    // and for runtime to int

    console.log("Movie Release Date: ", movie.release_date)
    const convertedReleaseDate =  new Date(movie.release_date).toDateString;
    console.log("Movie Release Date converted: ", convertedReleaseDate)

    //requestBody.release_date = convertedReleaseDate;
    requestBody.runtime = parseInt(movie.runtime, 10);
    
    let requestOptions = {
      body: JSON.stringify(requestBody),
      method: method,
      headers: headers,
      credentials: "include",
    };

    fetch(`http://localhost:8080/admin/movies/${movie.id}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        navigate("/manage-catalog");
      }
    })
    .catch(err => {
      console.log(err);
    })
  };

  const handleChange = () => (event) => {
    const value = event.target.value;
    const name = event.target.name;
    setMovie({
      ...movie,
      [name]: value,
    });
  };

  const handleChecked = (event, position) => {
    console.log("handleChecked called");
    console.log("value in handleChecked", event.target.value);
    console.log("checked is ", event.target.checked);
    console.log("position is ", position);

    let tmpArr = movie.genres;
    tmpArr[position].checked = !tmpArr[position].checked;

    let tmpIDs = movie.genres_array;
    if (!event.target.checked) {
      tmpIDs.splice(tmpIDs.indexOf(event.target.value));
    } else {
      tmpIDs.push(parseInt(event.target.value, 10));
    }
    setMovie({
      ...movie,
      genres_array: tmpIDs,
    });
  };

  return (
    <div>
      <h2>Add/Edit Movie</h2>
      <hr />
      {/* <pre>{JSON.stringify(movie, null, 3)}</pre> */}
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={movie.id} id="id"></input>

        <Input
          title={"Title"}
          className={"form-control"}
          type={"text"}
          name={"title"}
          value={movie.title}
          onChange={handleChange("title")}
          errorDiv={hasError("title") ? "text-danger" : "d-none"}
          errorMsg={"Please enter a title"}
        />
        <Input
          title={"Release Date"}
          className={"form-control"}
          type={"date"}
          name={"release_date"}
          value={movie.release_date}
          onChange={handleChange("release_date")}
          errorDiv={hasError("release_date") ? "text-danger" : "d-none"}
          errorMsg={"Please enter a release date"}
        />
        <Input
          title={"Runtime"}
          className={"form-control"}
          type={"text"}
          name={"runtime"}
          value={movie.runtime}
          onChange={handleChange("runtime")}
          errorDiv={hasError("runtime") ? "text-danger" : "d-none"}
          errorMsg={"Please enter a runtime"}
        />
        <Select
          title={"MPAA Rating"}
          name={"mpaa_rating"}
          options={mpaaOptions}
          onChange={handleChange("mpaa_rating")}
          placeHolder={"Choose..."}
          errorMsg={"Please choose"}
          errorDiv={hasError("mpaa_rating") ? "text-danger" : "d-none"}
        />
        <TextArea
          title={"Description"}
          name={"description"}
          value={movie.description}
          rows={"3"}
          onChange={handleChange("description")}
          errorMsg={"Please enter a description"}
          errorDiv={hasError("description") ? "text-danger" : "d-none"}
        />
        <hr />

        <h3>Genres</h3>

        {movie.genres && movie.genres.length > 1 && (
          <>
            {Array.from(movie.genres).map((g, index) => (
              <Checkbox
                title={g.genre}
                name={"genre"}
                key={index}
                id={"genre-" + index}
                onChange={(event) => handleChecked(event, index)}
                value={g.id}
                checked={movie.genres[index].checked}
              />
            ))}
          </>
        )}

        <hr />
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  );
};

export default EditMovie;
