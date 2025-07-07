import PropTypes from "prop-types";

const PortfolioItem = ({ title, description, image, link }) => (
  <div className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden flex flex-col">
    {image && (
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
      />
    )}
    <div className="p-6 flex-1 flex flex-col">
      <h2 className="font-semibold text-xl mb-2">{title}</h2>
      <p className="text-gray-700 flex-1">{description}</p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block border-2 border-[#0057FF] text-[#0057FF] rounded-full px-6 py-2 font-semibold hover:bg-[#0057FF]/10 transition"
        >
          View Project
        </a>
      )}
    </div>
  </div>
);

PortfolioItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
  link: PropTypes.string,
};

export default PortfolioItem;