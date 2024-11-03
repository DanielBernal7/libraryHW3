import express from "express";
import fetch from "node-fetch";
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

let cachedHomeData = null;
let homeCacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000;


//This is advice I got from the internet to preload the data so that the user doesn't have to wait for the data to load
async function preloadHomeData() {
  try {
    let url = "https://openlibrary.org/trending/yearly.json";
    let response = await fetch(url);
    let data = await response.json();

    let books = data.works.slice(0, 10);
    let bookDetails = [];

    for (let i = 0; i < books.length; i++) {
      let imageUrl;

      if (books[i].cover_edition_key !== undefined) {
        let imageId = books[i].cover_edition_key;
        imageUrl = `https://covers.openlibrary.org/b/OLID/${imageId}.jpg`;
      } else if (books[i].cover_i !== undefined) {
        let imageId = books[i].cover_i;
        imageUrl = `https://covers.openlibrary.org/b/id/${imageId}-L.jpg`;
      } else {
        imageUrl = "img/bookCoverNotAvailable.png";
      }

      bookDetails.push({
        title: books[i].title,
        author: books[i].author_name ? books[i].author_name[0] : "Unknown Author",
        image: imageUrl
      });
    }

    cachedHomeData = bookDetails;
    homeCacheTime = Date.now();
    console.log("Preloaded home data into cache");
  } catch (error) {
    console.error("Error preloading data:", error);
  }
}

preloadHomeData();


app.get("/", async (req, res) => {
  const now = Date.now();

  if (cachedHomeData && homeCacheTime && (now - homeCacheTime < CACHE_DURATION)) {
    console.log("Serving from cache");
    return res.render("home.ejs", { bookDetails: cachedHomeData });
  }


  let url = "https://openlibrary.org/trending/yearly.json"
  let response = await fetch(url);
  let data = await response.json();

  let books = data.works.slice(0, 10);
  let bookDetails = [];
    

  for(let i = 0; i < books.length; i++){
    let imageUrl;

    if(!(books[i].cover_edition_key == undefined)){
      let imageId = books[i].cover_edition_key;
      imageUrl = `https://covers.openlibrary.org/b/OLID/${imageId}.jpg`;
    } else if (books[i].cover_i !== undefined) {
      let imageId = books[i].cover_i;
      imageUrl = `https://covers.openlibrary.org/b/id/${imageId}-L.jpg`;
    } else {
      imageUrl = "img/bookCoverNotAvailable.png";
    }
      bookDetails.push({
          title: books[i].title,
          author : books[i].author_name[0],
          image : imageUrl
      })
  }


  cachedHomeData = bookDetails;
  homeCacheTime = Date.now();


  res.render("home.ejs", { bookDetails });
});

app.get("/booksByTitle", async (req, res) => {
    let title = req.query.title;

    let url = `https://openlibrary.org/search.json?q=${title}`;
    let response = await fetch(url);
    let data = await response.json();

    let books = data.docs.slice(0, 5);
    console.log(data);

    let bookDetails = [];
    

    for(let i = 0; i < books.length; i++){
      let imageUrl;

      if(!(books[i].cover_edition_key == undefined)){
        let imageId = books[i].cover_edition_key;
        imageUrl = `https://covers.openlibrary.org/b/OLID/${imageId}.jpg`;
      } else if (books[i].cover_i !== undefined) {
        let imageId = books[i].cover_i;
        imageUrl = `https://covers.openlibrary.org/b/id/${imageId}-L.jpg`;
      } else {
        imageUrl = "img/bookCoverNotAvailable.png";
      }


        bookDetails.push({
            title: books[i].title,
            author : books[i].author_name[0],
            image : imageUrl
        })
    }

    for(let i = 0; i < bookDetails.length; i++){
        console.log(bookDetails[i].title);
    }

    res.render("bookTitle.ejs", { bookDetails});
  });

app.listen(3000, () => {
  console.log("server started");
});
