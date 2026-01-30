import s from "../../skeleton.module.css";
import p from "./page.module.css";

export default function ProductLoading() {
  return (
    <div className={p.productPage}>
      <div className={p.productContainer}>
        {/* Gallery */}
        <div className={p.productGallery}>
          <div className={`${s.bone} ${p.productMainImage}`} />
          <div className={p.productThumbnails}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`${s.bone}`} style={{ aspectRatio: "1" }} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className={p.productInfo}>
          <div className={`${s.bone} ${s.h1}`} />
          <div className={`${s.bone} ${s.h3}`} style={{ maxWidth: "6rem" }} />
          <div>
            <div className={`${s.bone} ${s.text}`} />
            <div
              className={`${s.bone} ${s.text}`}
              style={{ marginTop: "var(--space-sm)" }}
            />
            <div
              className={`${s.bone} ${s.textShort}`}
              style={{ marginTop: "var(--space-sm)" }}
            />
          </div>
          <div className={`${s.bone} ${s.button}`} />
        </div>
      </div>
    </div>
  );
}
