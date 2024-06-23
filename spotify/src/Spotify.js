import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import {} from "react-bootstrap";
import { useState, useEffect } from "react";
import {
  Container,
  InputGroup,
  FormControl,
  Button,
  Row,
  Card,
  ToggleButtonGroup,
  ToggleButton,
} from "react-bootstrap";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

function Spotify() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [name, setName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchType, setSearchType] = useState("");
  const [artistPic, setArtistPic] = useState("");
  const [artistName, setArtistName] = useState("");
  const [searched, setSearched] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedTrackUri, setSelectedTrackUri] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to handle going back to search from the selected album view
  const handleBackToSearch = () => {
    setSelectedAlbum(null);
    setSelectedTrackUri("");
  };

  // Function to handle the selection of the first search option (Albums)
  const handleSelection1 = (option) => {
    setAlbums([]);
    setSearched("");
    setSelectedTrackUri("");
    setSelectedAlbum(null);
    if (selectedOption === "option1") {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
      setSearchType("/albums?include_groups=album&market=US&limit=50");
    }
  };

  // Function to handle the selection of the second search option (Top Songs)
  const handleSelection2 = (option) => {
    setAlbums([]);
    setSearched("");
    setSelectedTrackUri("");
    setSelectedAlbum(null);
    if (selectedOption === "option2") {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
      setSearchType(`/top-tracks?market=US`);
    }
  };

  useEffect(() => {
    // API Access Token
    var authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    };
    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then(
        (data) => setAccessToken(data.access_token),
        setSearchType("/albums?include_groups=album&market=US&limit=50")
      );
  }, []);

  async function searchArtist() {
    setAlbums([]);
    // Get request using search to get Artist ID
    var searchParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    var artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      searchParameters
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.artists.items);
        //setOtherArtists(data.items);
        return data.artists.items[0].id;
      });

    // Get request with Artist ID grab all the albums from that artist
    await fetch(
      "https://api.spotify.com/v1/artists/" + artistID,
      // change this for search line
      searchParameters
    ) // album,sinle gets more stuff
      .then((response) => response.json())
      .then((data) => {
        setName(data.name);
        setArtistPic(data.images[0].url);
        setAlbums([]);
        setSearched("searched");
      });
    // Display those albums to the user
  }

  async function search() {
    setAlbums([]);
    // Get request using search to get Artist ID
    var searchParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    var artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      searchParameters
    )
      .then((response) => response.json())
      .then((data) => {
        return data.artists.items[0].id;
      });

    // Get request with Artist ID grab all the albums from that artist
    await fetch(
      "https://api.spotify.com/v1/artists/" + artistID + searchType,
      searchParameters
    ) // album,sinle gets more stuff
      .then((response) => response.json())
      .then((data) => {
        if (searchType === "/top-tracks?market=US") {
          setAlbums(data.tracks);
          setName(data.tracks[0].artists[0].name);
        } else {
          setName(data.items[0].artists[0].name);
          setAlbums(data.items);
        }
        setArtistPic("");
        setArtistName("");
        setSearched("searched");
      });
    // Display those albums to the user
  }

  // Function to play the previous track in the selected album
  const playPreviousTrack = () => {
    const previousIndex =
      (currentIndex - 1 + selectedAlbum.tracks.length) %
      selectedAlbum.tracks.length;
    setSelectedTrackUri(selectedAlbum.tracks[previousIndex].uri);
    setCurrentIndex(previousIndex);
  };

  // Function to play the next track in the selected album
  const playNextTrack = () => {
    const nextIndex = (currentIndex + 1) % selectedAlbum.tracks.length;
    setSelectedTrackUri(selectedAlbum.tracks[nextIndex].uri);
    setCurrentIndex(nextIndex);
  };

  // Function to select and display an album with its tracks
  const selectAlbum = async (album) => {
    try {
      const searchParameters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      const response = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        searchParameters
      );

      const data = await response.json();

      setSelectedAlbum({
        ...album,
        tracks: data.items,
      });

      // Automatically play the first track in the album
      if (data.items.length > 0) {
        setSelectedTrackUri(data.items[0].uri);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error fetching album tracks:", error);
    }
  };

  return (
    <div className="App">
      <Container>
        <br />
        <h1
          style={{
            color: "#1ab26b",
            fontWeight: "550",
            paddingRight: "10px",
          }}
        >
          <img
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green-768x231.png"
            alt="Spotify"
            className="img-fluid"
            width="200"
            style={{ marginBottom: "10px" }}
          />{" "}
          Search
        </h1>

        <ToggleButtonGroup type="radio" name="options" defaultValue={null}>
          <ToggleButton
            id="option1"
            value="option1"
            variant="light"
            style={{
              backgroundColor:
                selectedOption === "option1" ? "#1ab26b" : "white",
              color: selectedOption === "option1" ? "white" : "black",
              border: "1px solid black",
            }}
            onClick={() => handleSelection1("option1")}
          >
            Albums
          </ToggleButton>
          <ToggleButton
            id="option2"
            value="option2"
            variant="light"
            style={{
              backgroundColor:
                selectedOption === "option2" ? "#1ab26b" : "white",
              color: selectedOption === "option2" ? "white" : "black",
              border: "1px solid black",
            }}
            onClick={() => handleSelection2("option2")}
          >
            Top Songs
          </ToggleButton>
        </ToggleButtonGroup>

        <Container style={{ margin: "20px 0" }}></Container>

        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Search By Artist"
            type="input"
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                event.target.value !== "" &&
                selectedOption != null
              ) {
                search();
              } else if (event.key === "Enter" && event.target.value !== "") {
                searchArtist();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button
            onClick={() => {
              if (searchInput !== "" && selectedOption != null) {
                search();
              } else if (searchInput !== "") {
                searchArtist();
              }
            }}
          >
            Search
          </Button>
        </InputGroup>
      </Container>

      {selectedOption === "option1" && selectedAlbum && (
        <Container>
          <Button onClick={handleBackToSearch} variant="light">
            Back to Search
          </Button>
          <p>{`Songs in ${selectedAlbum.name}`}</p>
          <Row className="mx-2 row row-cols-4">
            {selectedAlbum.tracks &&
              selectedAlbum.tracks.map((track, i) => (
                <Card key={i} className="no-border">
                  {track.album &&
                  track.album.images &&
                  track.album.images.length > 0 ? (
                    <>
                      <Card.Img src={track.album.images[0].url} />
                      <Button
                        variant="primary"
                        onClick={() => setSelectedTrackUri(track.uri)}
                      >
                        Play
                      </Button>
                    </>
                  ) : (
                    <Card.Img
                      src={selectedAlbum.images[0].url}
                      alt="albumImg"
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{track.name}</Card.Title>
                  </Card.Body>
                </Card>
              ))}
          </Row>
          {selectedTrackUri && (
            <div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button onClick={playPreviousTrack}>Previous</Button>
                <iframe title="track"
                  src={`https://open.spotify.com/embed/track/${
                    selectedTrackUri.split(":")[2]
                  }`}
                  width="300"
                  height="80"
                  allowtransparency="true"
                  allow="encrypted-media"
                ></iframe>
                <Button onClick={playNextTrack}>Next</Button>
              </div>
            </div>
          )}
        </Container>
      )}

      {selectedOption === "option1" && (
        <Container>
          <p>
            {name && selectedOption && searched && `Showing albums by ${name}`}
          </p>
          <Row className="mx-2 row row-cols-4">
            {albums.map((album, i) => (
              <Card key={i} className="no-border" onClick={() => selectAlbum(album)}>
                <Card.Img src={album.images[0].url} />
                <Card.Body>
                  <Card.Title>{album.name}</Card.Title>
                </Card.Body>
              </Card>
            ))}
          </Row>
        </Container>
      )}

      {selectedOption === "option2" && (
        <Container>
          <p>
            {name &&
              selectedOption &&
              searched &&
              `Showing top songs by ${name}`}
          </p>
          <Row className="mx-2 row row-cols-4">
            {albums.map((album, i) => (
              <Card key={i} className="no-border">
                <Card.Img src={album.album.images[0].url} />
                <Card.Body>
                  <Card.Title>{album.name}</Card.Title>
                </Card.Body>
              </Card>
            ))}
          </Row>
        </Container>
      )}

      {searchInput !== "" && !selectedOption && artistPic && searched && (
        <Container>
          <p>{name}</p>
          <Card className="no-border"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
            >
            <Card.Img
              src={artistPic}
              style={{ width: "400px", height: "400px", objectFit: "cover" }}
            />
            <Card.Body>
              <Card.Title>{artistName}</Card.Title>
            </Card.Body>
          </Card>
        </Container>
      )}
      <br />
    </div>
  );
}

export default Spotify;
