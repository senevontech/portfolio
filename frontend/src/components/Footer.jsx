import React from "react";

export default function Footer() {
  return (
    <footer className="footer reveal">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <span className="brand-mark">S</span>enevon
          </div>
          <p className="fine">
            Tech receive client approval. Fun Lorem Ipsum text may appear in any
            size and font to simulate everything you create for your campaigns.
          </p>
          <div className="socials">
            <a href="#!">in</a>
            <a href="#!">f</a>
            <a href="#!">ig</a>
            <a href="#!">yt</a>
          </div>
        </div>

        <div>
          <h4 className="foot-head">PRODUCT</h4>
          <ul className="foot-links">
            <li><a href="#!">Wallpaper</a></li>
            <li><a href="#!">Code Editor</a></li>
            <li><a href="#!">Sports Management System</a></li>
            <li><a href="#!">ERP systems</a></li>
            <li><a href="#!">Learning Management System</a></li>
            <li><a href="#!">Games</a></li>
          </ul>
        </div>

        <div>
          <h4 className="foot-head">Services</h4>
          <ul className="foot-links">
            <li><a href="#!">Designing</a></li>
            <li><a href="#!">Customised Website</a></li>
            <li><a href="#!">Customised Application</a></li>
            <li><a href="#!">Customised Software</a></li>
          </ul>
        </div>
      </div>

      <div className="giant-watermark">SEVEN</div>
    </footer>
  );
}
