import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <span className="footer__logo">👑 Hora de Prosperar</span>
          <p className="footer__desc">Transforma tu mentalidad y manifiesta la vida de tus sueños.</p>
        </div>
        <div className="footer__links">
          <a href="#">Términos de Uso</a>
          <a href="#">Política de Privacidad</a>
          <a href="#">Soporte</a>
        </div>
      </div>
      <div className="footer__bottom">
        &copy; {new Date().getFullYear()} Hora de Prosperar. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
