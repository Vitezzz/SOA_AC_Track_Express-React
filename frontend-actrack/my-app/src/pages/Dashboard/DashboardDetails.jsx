import EmptyState from "../../components/EmptyState";

const DashboardDetails = () => (
  <div>
    <h2 className="page-title" style={{ margin: 0 }}>Dashboard Details</h2>
    <EmptyState
      bare
      icon="spark"
      title="Sección en construcción"
      description="Aquí vivirán las métricas y reportes detallados del dashboard."
    />
  </div>
);

export default DashboardDetails;
