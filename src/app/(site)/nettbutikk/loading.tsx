import s from "../skeleton.module.css";
import p from "./page.module.css";

function ProductCardBone() {
  return (
    <div className={p.shopProductItem}>
      <div className={p.shopProductColumn}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-md)" }}>
          <div className={`${s.bone} ${s.h3}`} style={{ flex: 1 }} />
          <div className={`${s.bone} ${s.textXs}`} style={{ width: "4rem" }} />
        </div>
        <div className={`${s.bone} ${s.imageSquare}`} />
      </div>
    </div>
  );
}

function CategoryBone() {
  return (
    <div className={p.shopSection}>
      <div className={p.shopSidebar}>
        <div className={p.shopSidebarContent}>
          <div className={`${s.bone} ${s.h2}`} style={{ maxWidth: "80%" }} />
          <div className={`${s.bone} ${s.text}`} style={{ marginTop: "var(--space-md)" }} />
          <div
            className={`${s.bone} ${s.textShort}`}
            style={{ marginTop: "var(--space-sm)" }}
          />
        </div>
      </div>
      <div className={p.shopProductGrid}>
        {[0, 1, 2, 3].map((i) => (
          <ProductCardBone key={i} />
        ))}
      </div>
    </div>
  );
}

export default function ShopLoading() {
  return (
    <div className={p.shopPage}>
      <div className={p.shopHeader}>
        <h1 className={p.shopTitle}>Nettbutikk</h1>
      </div>
      <div className={p.shopSections}>
        {[0, 1, 2].map((i) => (
          <CategoryBone key={i} />
        ))}
      </div>
    </div>
  );
}
