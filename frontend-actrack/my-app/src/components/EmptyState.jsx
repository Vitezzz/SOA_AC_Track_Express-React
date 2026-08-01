import Icon from "./Icon";

const EmptyState = ({ icon = "note", title, description, bare = false, children }) => (
  <div className={bare ? "empty-state" : "panel empty-state"}>
    <div className="empty-state-icon">
      <Icon name={icon} />
    </div>
    <p className="empty-state-title">{title}</p>
    {description && <p className="empty-state-description">{description}</p>}
    {children}
  </div>
);

export default EmptyState;
