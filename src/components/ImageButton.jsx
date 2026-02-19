import "./ImageButton.css";

export default function ImageButton({ image, text, url }) {
  const handleClick = () => {
    window.open(url, "_blank");
  };

  return (
    <button className="image-card" onClick={handleClick}>
      <img src={image} alt={text} />
      <div className="overlay">
        <span>{text}</span>
      </div>
    </button>
  );
}
