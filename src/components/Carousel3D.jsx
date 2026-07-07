import { useState, useRef, useEffect, useCallback, useId } from "react";
import "./Carousel3D.css";

export default function Carousel3D({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [jumpValue, setJumpValue] = useState("");
  const [jumpError, setJumpError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultIndex, setSearchResultIndex] = useState(0);
  const containerRef = useRef(null);
  const inputId = useId();
  const count = items.length;

  const goTo = useCallback(
    (index) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveIndex(((index % count) + count) % count);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [count, isAnimating]
  );

  const prev = () => goTo(activeIndex - 1);
  const next = () => goTo(activeIndex + 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, isAnimating]);

  // Touch / mouse drag
  const onDragStart = (clientX) => {
    setIsDragging(true);
    setDragStart(clientX);
  };
  const onDragEnd = (clientX) => {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = dragStart - clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
  };

  const getCardStyle = (index) => {
    // How many positions away from center
    let diff = index - activeIndex;
    // Wrap around
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;

    const absD = Math.abs(diff);

    // Only show cards within ±3 positions
    if (absD > 3) return { display: "none" };

    const zBase = -120 * absD;
    const xOffset = diff * 155;
    const scale = Math.pow(0.82, absD);
    const opacity = absD === 0 ? 1 : absD === 1 ? 0.75 : absD === 2 ? 0.45 : 0.2;
    const zIndex = 10 - absD;
    const rotateY = diff * -18;
    const blur = absD === 0 ? 0 : absD === 1 ? 1 : absD >= 2 ? 2.5 : 4;

    return {
      transform: `translateX(${xOffset}px) translateZ(${zBase}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      filter: blur > 0 ? `blur(${blur}px)` : "none",
      pointerEvents: diff === 0 ? "auto" : absD === 1 ? "auto" : "none",
      cursor: diff === 0 ? (items[index].url ? "pointer" : "default") : "pointer",
    };
  };

  const handleJump = (e) => {
    e.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (isNaN(num) || num < 1 || num > count) {
      setJumpError(true);
      setTimeout(() => setJumpError(false), 600);
      return;
    }
    goTo(num - 1);
    setJumpValue("");
  };

  const activeItem = items[activeIndex];

  const filteredIndices = items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(({ i }) => i);

  const handleCardClick = (index) => {
    let diff = index - activeIndex;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;

    if (diff === 0) {
      if (activeItem.url) window.open(activeItem.url, "_blank");
    } else {
      goTo(index);
    }
  };

  return (
    <div className="carousel-wrapper">
      {/* Stage */}
      <div
        className="carousel-stage"
        ref={containerRef}
        onMouseDown={(e) => onDragStart(e.clientX)}
        onMouseUp={(e) => onDragEnd(e.clientX)}
        onMouseLeave={(e) => isDragging && onDragEnd(e.clientX)}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
      >
        <div className="carousel-track">
          {items.map((item, index) => {
            const style = getCardStyle(index);
            if (style.display === "none") return null;

            const diff = ((index - activeIndex + count) % count + count) % count;
            const signedDiff = diff > count / 2 ? diff - count : diff;
            const isActive = signedDiff === 0;
            const lines = item.text.split("\n");
            const jornada = lines[0] || "";
            const rival = lines.slice(1).join(" ");

            return (
              <div
                key={index}
                className={`carousel-card ${isActive ? "active" : ""} ${!item.url && isActive ? "no-url" : ""}`}
                style={style}
                onClick={() => handleCardClick(index)}
                title={!item.url ? `${item.text} (aviat disponible)` : item.text}
              >
                <div className="card-inner">
                  <img src={item.image} alt={item.text} draggable={false} />
                  <div className="card-overlay">
                    <span className="card-jornada">{jornada}</span>
                    <span className="card-rival">{rival}</span>
                    {isActive && item.url && (
                      <span className="card-cta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Obrir
                      </span>
                    )}
                    {isActive && !item.url && (
                      <span className="card-soon">Aviat disponible</span>
                    )}
                  </div>
                  {/* Decorative badge */}
                  <div className="card-badge" aria-hidden="true" />
                  {/* Active glow ring */}
                  {isActive && <div className="card-glow-ring" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="carousel-nav">
        <button className="nav-btn nav-prev" onClick={prev} aria-label="Anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {/* Dots */}
        <div className="carousel-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === activeIndex ? "dot-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Ir a ${items[i].text}`}
            />
          ))}
        </div>

        <button className="nav-btn nav-next" onClick={next} aria-label="Següent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Counter */}
      <div className="carousel-counter">
        <span className="counter-current">{String(activeIndex + 1).padStart(2, "0")}</span>
        <span className="counter-sep"> / </span>
        <span className="counter-total">{String(count).padStart(2, "0")}</span>
      </div>

      {/* Controls row: Jump + Search alineats */}
      <div className="carousel-controls-row">

        {/* Jump to jornada */}
        <form className="carousel-jump" onSubmit={handleJump}>
          <label className="jump-label" htmlFor={inputId}>Anar a la jornada</label>
          <div className="jump-row">
            <input
              id={inputId}
              className={`jump-input${jumpError ? " jump-error" : ""}`}
              type="number"
              min="1"
              max={count}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              placeholder="Nº"
            />
            <button className="jump-btn" type="submit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </form>

        {/* Separador vertical */}
        <div className="controls-divider" aria-hidden="true" />

        {/* Search */}
        <div className="carousel-jump">
          <label className="jump-label">Cercar partit</label>
          <div className="jump-row">
            <input
              className="jump-input jump-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setSearchResultIndex(0);
                if (val !== "") {
                  const newFiltered = items
                    .map((item, i) => ({ item, i }))
                    .filter(({ item }) => item.text.toLowerCase().includes(val.toLowerCase()))
                    .map(({ i }) => i);
                  if (newFiltered.length > 0) goTo(newFiltered[0]);
                }
              }}
              placeholder="palau, torrelavega..."
            />
            {searchQuery ? (
              <button
                className="jump-btn"
                type="button"
                onClick={() => { setSearchQuery(""); setSearchResultIndex(0); }}
                aria-label="Esborrar cerca"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            ) : (
              <span className="jump-btn jump-btn-icon" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
            )}
          </div>

          {/* Navegació entre resultats */}
          {searchQuery && filteredIndices.length > 0 && (
            <div className="search-nav">
              {filteredIndices.length > 1 && (
                <button
                  className="search-nav-btn"
                  type="button"
                  onClick={() => {
                    const prev = (searchResultIndex - 1 + filteredIndices.length) % filteredIndices.length;
                    setSearchResultIndex(prev);
                    goTo(filteredIndices[prev]);
                  }}
                  aria-label="Resultat anterior"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
              )}
              <span className="search-nav-count">
                <span className="search-nav-current">{searchResultIndex + 1}</span>
                <span className="search-nav-sep">/</span>
                <span>{filteredIndices.length}</span>
              </span>
              {filteredIndices.length > 1 && (
                <button
                  className="search-nav-btn"
                  type="button"
                  onClick={() => {
                    const next = (searchResultIndex + 1) % filteredIndices.length;
                    setSearchResultIndex(next);
                    goTo(filteredIndices[next]);
                  }}
                  aria-label="Resultat següent"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )}
            </div>
          )}

          {searchQuery && filteredIndices.length === 0 && (
            <div className="jump-label" style={{ color: "rgba(255,100,100,0.7)", marginTop: "4px" }}>
              Sense resultats
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
