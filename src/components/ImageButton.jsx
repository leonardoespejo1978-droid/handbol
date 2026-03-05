import "./ImageButton.css";

export default function ImageButton({ image, text, url }) {
  const handleClick = () => {
    if (url) window.open(url, "_blank");
  };

  // Separa "Jornada X" del nombre del rival
  const lines = text.split("\n");
  const jornada = lines[0] || "";
  const rival = lines.slice(1).join(" ");

  return (
    <button
      className={`image-card${!url ? " no-url" : ""}`}
      onClick={handleClick}
      title={url ? text : `${text} (aviat disponible)`}
    >
      <img src={image} alt={text} />

      {/* Badge decorativo blaugrana */}
      <div className="corner-badge" aria-hidden="true" />

      <div className="overlay">
        <span className="jornada-num">{jornada}</span>
        {rival}
      </div>
    </button>
  );
}
