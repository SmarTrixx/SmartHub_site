const ServiceCard = ({ title, description, icon }) => (
  <div className="border rounded-xl p-4 shadow-md">
    <div className="text-3xl">{icon}</div>
    <h3 className="font-bold mt-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default ServiceCard;
