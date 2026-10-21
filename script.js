import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// This is the Firebase Web app config you shared.
const firebaseConfig = {
  apiKey: "AIzaSyAb4Gg3DHvgPCqcJw7bREYo142PUtD2vRQ",
  authDomain: "mystery-mini-game.firebaseapp.com",
  projectId: "mystery-mini-game",
  storageBucket: "mystery-mini-game.firebasestorage.app",
  messagingSenderId: "500892934449",
  appId: "1:500892934449:web:4f7678c2be64ae8aa05010"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const puzzles = [
  {
    chapter: "CHAPTER 1: THE GETAWAY",
    mascot: "🛵",
    title: "The raccoon made a run for it!",
    story:
      "A tiny raccoon zooms past you on a scooter, clutching a cookie bag. It drops a note while making a dramatic getaway.",
    question: "The note says: 2, 4, 8, 16, __. What number comes next?",
    answers: ["32", "thirty two", "thirty-two"],
    hint: "Each number is double the one before it.",
    success:
      "The number 32 is stamped on a tiny door nearby. The raccoon’s scooter tracks lead inside."
  },
  {
    chapter: "CHAPTER 2: THE SECRET MESSAGE",
    mascot: "🗝️",
    title: "A very suspicious door",
    story:
      "Inside the door is a hallway full of squeaky rubber ducks. One duck holds a coded message. It says every letter has been moved one step forward in the alphabet.",
    question: "Decode this word by moving each letter one step backward: DBLF",
    answers: ["cake"],
    hint: "D becomes C. B becomes A. Move every letter back one.",
    success:
      "You decoded CAKE. Behind a cake-shaped painting, you find three suspect statements."
  },
  {
    chapter: "CHAPTER 3: WHO TOOK THE COOKIE?",
    mascot: "🕵️",
    title: "The suspects disagree",
    story:
      "The fox says, “The pigeon stole it.” The pigeon says, “The raccoon stole it.” The raccoon says, “I did not steal it.”",
    question:
      "Exactly ONE suspect is telling the truth. Who stole the cookie: fox, pigeon, or raccoon?",
    answers: ["raccoon", "the raccoon"],
    hint:
      "If the raccoon stole it, check all three statements. Only the pigeon would be telling the truth.",
    success:
      "The raccoon confesses. But the cookie is gone — it has been moved to the Moon Cookie vault!"
  },
  {
    chapter: "CHAPTER 4: THE MOON COOKIE VAULT",
    mascot: "🌙",
    title: "Three doors. One cookie.",
    story:
      "The vault has red, blue, and green doors. RED says, “The cookie is not here.” BLUE says, “The cookie is behind the green door.” GREEN says, “The blue sign is lying.”",
    question:
      "Exactly ONE sign is true. Which door should you open: red, blue, or green?",
    answers: ["red", "the red door"],
    hint:
      "Try each door. If the cookie is behind the red door, only the green door’s sign is true.",
    success:
      "The red door swings open! The Moon Cookie is safe. The raccoon wanted to throw a surprise party and panicked."
  }
];

let currentPuzzle = 0;
let solvedCount = 0;
let wrongGuesses = 0;
let hintsUsed = 0;
let detectiveName = "Detective";
let alreadySolved = false;
let soundIsOn = true;
let gameHasStarted = false;

const startScreen = document.querySelector("#start-screen");
const puzzleScreen = document.querySelector("#puzzle-screen");
const reviewScreen = document.querySelector("#review-screen");
const answerInput = document.querySelector("#answer");
const answerForm = document.querySelector("#answer-form");
const feedback = document.querySelector("#feedback");
const nextButton = document.querySelector("#next-button");
const hintButton = document.querySelector("#hint-button");
const hintText = document.querySelector("#hint");

function playSound(soundId) {
  if (!soundIsOn) return;

  const sound = document.querySelector(soundId);
  sound.currentTime = 0;
  sound.play().catch(function () {});
}

function startGame() {
  const nameInput = document.querySelector("#player-name");
  detectiveName = nameInput.value.trim() || "Detective";

  startScreen.hidden = true;
  puzzleScreen.hidden = false;
  gameHasStarted = true;

  const music = document.querySelector("#background-music");
  music.volume = 0.2;

  if (soundIsOn) {
    music.play().catch(function () {});
  }

  showPuzzle();
}

function showPuzzle() {
  const puzzle = puzzles[currentPuzzle];

  alreadySolved = false;
  document.querySelector("#story").hidden = false;
  document.querySelector("#chapter").textContent = puzzle.chapter;
  document.querySelector("#mascot").textContent = puzzle.mascot;
  document.querySelector("#title").textContent = puzzle.title;
  document.querySelector("#story").textContent = puzzle.story;
  document.querySelector("#puzzle").textContent = puzzle.question;
  document.querySelector("#progress").textContent =
    `Puzzle ${currentPuzzle + 1} of ${puzzles.length}`;
  document.querySelector("#score").textContent =
    `Clues solved: ${solvedCount}`;

  answerInput.value = "";
  answerInput.disabled = false;
  document.querySelector("#submit-button").disabled = false;
  feedback.textContent = "";
  hintText.textContent = "";
  hintText.hidden = true;
  hintButton.hidden = false;
  nextButton.hidden = true;

  answerInput.focus();
}

function checkAnswer(event) {
  event.preventDefault();

  if (alreadySolved) return;

  const answer = answerInput.value.trim().toLowerCase();
  const puzzle = puzzles[currentPuzzle];

  if (puzzle.answers.includes(answer)) {
    alreadySolved = true;
    solvedCount += 1;
    playSound("#correct-sound");

    feedback.textContent = `✅ Correct! ${puzzle.success}`;
    answerInput.disabled = true;
    document.querySelector("#submit-button").disabled = true;
    hintButton.hidden = true;
    nextButton.hidden = false;

    nextButton.textContent =
      currentPuzzle === puzzles.length - 1
        ? "Finish the mystery →"
        : "Next clue →";
  } else {
    wrongGuesses += 1;
    playSound("#wrong-sound");

    feedback.textContent =
      "Not quite! Look closely at the clues and try again, Detective. 🧐";
    answerInput.select();
  }
}

function showHint() {
  hintText.textContent = puzzles[currentPuzzle].hint;
  hintText.hidden = false;
  hintsUsed += 1;
}

function goToNextPuzzle() {
  currentPuzzle += 1;

  if (currentPuzzle < puzzles.length) {
    showPuzzle();
  } else {
    showReviewScreen();
  }
}

function showReviewScreen() {
  puzzleScreen.hidden = true;
  reviewScreen.hidden = false;

  // Hide the previous scene so the vault clue doesn't remain at the end.
  document.querySelector("#story").hidden = true;

  document.querySelector("#chapter").textContent = "MYSTERY SOLVED";
  document.querySelector("#mascot").textContent = "🎉";
  document.querySelector("#title").textContent =
    `Case closed, ${detectiveName}!`;

  document.querySelector("#ending-story").textContent =
    `You solved all ${solvedCount} clues. The raccoon admits it stole the Moon Cookie because it was planning a surprise party and panicked. The pigeon is promoted to assistant detective, mostly for the hat.`;

  if (hintsUsed === 0 && wrongGuesses === 0) {
    document.querySelector("#compliment").textContent =
      "You solved the whole mystery without a single hint or wrong guess! Your brain is a cute little detective supercomputer. 🧠✨";
  } else if (hintsUsed <= 2) {
    document.querySelector("#compliment").textContent =
      "You stayed curious, followed the clues, and cracked the case. That clever, determined brain of yours is impressive. 🔎💜";
  } else {
    document.querySelector("#compliment").textContent =
      "You kept going even when the clues got tricky. Your persistence is seriously lovely. 🌟";
  }

  saveDetectiveAndLoadHall();
}

async function saveDetectiveAndLoadHall() {
  const countText = document.querySelector("#detective-count");
  const detectiveList = document.querySelector("#detective-list");

  countText.textContent = "Saving your detective entry…";
  detectiveList.replaceChildren();

  try {
    // Each completed play gets a new entry, including replays.
    await addDoc(collection(db, "detectives"), {
      playerName: detectiveName,
      completedAt: serverTimestamp()
    });

    const detectivesQuery = query(
      collection(db, "detectives"),
      orderBy("completedAt", "desc")
    );

    const snapshot = await getDocs(detectivesQuery);

    countText.textContent =
      `${snapshot.size} detective ${snapshot.size === 1 ? "has" : "have"} solved the case!`;

    snapshot.forEach(function (detectiveDocument) {
      const detective = detectiveDocument.data();
      const listItem = document.createElement("li");

      listItem.textContent = detective.playerName;
      detectiveList.appendChild(listItem);
    });
  } catch (error) {
    countText.textContent =
      "We couldn’t load the Detective Hall of Fame. Check your Firestore rules and try again.";
    console.error("Saving or loading detectives failed:", error);
  }
}

async function submitReview(event) {
  event.preventDefault();

  const message = document.querySelector("#review-message");
  const submitButton = document.querySelector("#submit-review-button");
  const rating = Number(document.querySelector("#rating").value);
  const comment = document.querySelector("#review-comment").value.trim();

  if (!rating || !comment) return;

  submitButton.disabled = true;
  submitButton.textContent = "Sharing your review…";
  message.textContent = "";

  try {
    await addDoc(collection(db, "reviews"), {
      playerName: detectiveName,
      rating: rating,
      comment: comment,
      createdAt: serverTimestamp()
    });

    message.textContent =
      "Your review is shared with the other detectives! 💌";
    document.querySelector("#review-form").reset();

    if (!document.querySelector("#reviews-area").hidden) {
      await loadReviews();
    }
  } catch (error) {
    message.textContent =
      "Your review couldn’t be sent. Check your Firebase setup and try again.";
    console.error("Review submission failed:", error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Share my review ♡";
  }
}

async function loadReviews() {
  const list = document.querySelector("#reviews-list");
  const status = document.querySelector("#reviews-status");

  status.textContent = "Loading reviews…";
  list.replaceChildren();

  try {
    const reviewsQuery = query(
      collection(db, "reviews"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(reviewsQuery);

    if (snapshot.empty) {
      status.textContent = "No reviews yet. Be the first detective to leave one!";
      return;
    }

    status.textContent = `Showing ${snapshot.size} recent review(s).`;

    snapshot.forEach(function (reviewDocument) {
      const review = reviewDocument.data();
      const item = document.createElement("li");
      const name = document.createElement("span");
      const comment = document.createElement("p");

      name.className = "review-name";
      name.textContent =
        `${"⭐".repeat(review.rating)} — ${review.playerName}`;

      comment.className = "review-comment";
      comment.textContent = review.comment;

      item.append(name, comment);
      list.appendChild(item);
    });
  } catch (error) {
    status.textContent =
      "We couldn’t load the reviews. Check your Firestore rules and try again.";
    console.error("Loading reviews failed:", error);
  }
}

function toggleReviews() {
  const area = document.querySelector("#reviews-area");
  const button = document.querySelector("#read-reviews-button");

  area.hidden = !area.hidden;

  if (area.hidden) {
    button.textContent = "Read other players’ reviews 💬";
  } else {
    button.textContent = "Hide reviews ↑";
    loadReviews();
  }
}

async function copyResult() {
  const result = [
    document.querySelector("#title").textContent,
    document.querySelector("#ending-story").textContent,
    document.querySelector("#compliment").textContent
  ].join(" ");

  try {
    await navigator.clipboard.writeText(result);
    document.querySelector("#copy-button").textContent = "Copied! ✨";
  } catch {
    window.prompt("Copy your detective report:", result);
  }
}

function restartGame() {
  currentPuzzle = 0;
  solvedCount = 0;
  wrongGuesses = 0;
  hintsUsed = 0;
  detectiveName = "Detective";
  gameHasStarted = false;

  reviewScreen.hidden = true;
  startScreen.hidden = false;

  const music = document.querySelector("#background-music");
  music.pause();
  music.currentTime = 0;

  document.querySelector("#story").hidden = false;
  document.querySelector("#chapter").textContent = "YOUR CASE BEGINS";
  document.querySelector("#mascot").textContent = "🦝";
  document.querySelector("#title").textContent = "The Great Snack Heist";
  document.querySelector("#story").textContent =
    "Someone has stolen the legendary Moon Cookie! The only clue is one glittery crumb and a pigeon wearing sunglasses. Enter your detective name and prepare for nonsense.";

  document.querySelector("#player-name").value = "";
  document.querySelector("#review-message").textContent = "";
  document.querySelector("#detective-count").textContent =
    "Your detective entry is saved in the Hall of Fame.";
  document.querySelector("#detective-list").replaceChildren();
  document.querySelector("#reviews-area").hidden = true;
  document.querySelector("#reviews-list").replaceChildren();
  document.querySelector("#reviews-status").textContent = "";
  document.querySelector("#read-reviews-button").textContent =
    "Read other players’ reviews 💬";
  document.querySelector("#copy-button").textContent =
    "Copy my detective report ✨";
}

function toggleSound() {
  soundIsOn = !soundIsOn;

  const soundButton = document.querySelector("#sound-button");
  const music = document.querySelector("#background-music");

  soundButton.textContent = soundIsOn ? "🔊 Sound on" : "🔇 Sound off";

  if (soundIsOn && gameHasStarted) {
    music.play().catch(function () {});
  } else {
    music.pause();
  }
}

document.querySelector("#start-button").addEventListener("click", startGame);
answerForm.addEventListener("submit", checkAnswer);
hintButton.addEventListener("click", showHint);
nextButton.addEventListener("click", goToNextPuzzle);
document.querySelector("#review-form").addEventListener("submit", submitReview);
document
  .querySelector("#read-reviews-button")
  .addEventListener("click", toggleReviews);
document.querySelector("#copy-button").addEventListener("click", copyResult);
document.querySelector("#restart-button").addEventListener("click", restartGame);
document.querySelector("#sound-button").addEventListener("click", toggleSound);