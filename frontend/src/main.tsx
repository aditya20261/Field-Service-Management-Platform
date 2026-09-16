import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

import {
  apiRequest,
  setToken,
  clearToken,
  getToken
} from "./services/api";

/* =========================================================
   TYPES
========================================================= */

type Auth = {
  token: string;
  role: string;
  fullName: string;
};

type CustomerDashboard = {
  totalWorkOrders: number;
  newWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  totalServiceRequests: number;
  newServiceRequests: number;
  inProgressServiceRequests: number;
  completedServiceRequests: number;
  totalSites: number;
};

type ManagerDashboard = {
  totalWorkOrders: number;
  newWorkOrders: number;
  assignedWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  onTimeSla: number;
  atRiskSla: number;
  breachedSla: number;
  totalTechnicians: number;
  activeTechnicians: number;
  totalParts: number;
  lowStockParts: number;
  totalLoggedMinutes: number;
};

type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
};

type WorkOrder = {
  id: number;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  technicianId: number | null;
  technicianName: string | null;
  title: string;
  description: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  slaDueAt: string | null;
  slaStatus: string | null;
};

type Site = {
  id: number;
  customerId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

type ServiceRequest = {
  id: number;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
};

/* =========================================================
   AUTH STORAGE
========================================================= */

function getStoredAuth(): Auth | null {
  const saved = localStorage.getItem("keystoneAuth");

  if (!saved) {
    return null;
  }

  try {
    const auth = JSON.parse(saved) as Auth;

    if (!auth.token || !auth.role) {
      localStorage.removeItem("keystoneAuth");
      clearToken();
      return null;
    }

    if (!getToken()) {
      setToken(auth.token);
    }

    return auth;
  } catch {
    localStorage.removeItem("keystoneAuth");
    clearToken();
    return null;
  }
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [auth, setAuth] = useState<Auth | null>(
    getStoredAuth
  );

  function logout() {
    clearToken();
    localStorage.removeItem("keystoneAuth");
    setAuth(null);
  }

  if (!auth) {
    return <AuthScreen onLogin={setAuth} />;
  }

  if (auth.role === "CUSTOMER") {
    return (
      <CustomerPortal
        auth={auth}
        logout={logout}
      />
    );
  }

  return (
    <RoleDashboard
      auth={auth}
      logout={logout}
    />
  );
}

/* =========================================================
   LOGIN
========================================================= */

function AuthScreen({
  onLogin
}: {
  onLogin: (auth: Auth) => void;
}) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const endpoint = register
      ? "/auth/register"
      : "/auth/login";

    const body = register
      ? {
          fullName: name,
          email,
          password
        }
      : {
          email,
          password
        };

    try {
      const data = await apiRequest<Auth>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify(body)
        }
      );

      if (!data.token) {
        throw new Error(
          "Authentication token was not returned"
        );
      }

      setToken(data.token);

      localStorage.setItem(
        "keystoneAuth",
        JSON.stringify(data)
      );

      onLogin(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Request failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <section className="auth-card">
        <div className="brand">
          KEYSTONE
        </div>

        <div className="auth-heading">
          <span className="eyebrow">
            FIELD SERVICE PLATFORM
          </span>

          <h1>
            {register
              ? "Create Customer Account"
              : "Welcome Back"}
          </h1>

          <p>
            {register
              ? "Create your customer portal account."
              : "Sign in to access your KEYSTONE workspace."}
          </p>
        </div>

        <form onSubmit={submit}>
          {register && (
            <label>
              Full Name

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                required
              />
            </label>
          )}

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              required
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : register
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <button
          className="text-button"
          onClick={() => {
            setRegister(!register);
            setError("");
          }}
        >
          {register
            ? "Already have an account? Sign In"
            : "Customer? Create an account"}
        </button>
      </section>
    </main>
  );
}

/* =========================================================
   CUSTOMER PORTAL
========================================================= */

function CustomerPortal({
  auth,
  logout
}: {
  auth: Auth;
  logout: () => void;
}) {
  const [
    activePage,
    setActivePage
  ] = useState<
    "dashboard" | "work-orders" | "sites" | "requests"
  >("dashboard");

  const [dashboard, setDashboard] =
    useState<CustomerDashboard | null>(null);

  const [workOrders, setWorkOrders] =
    useState<WorkOrder[]>([]);

  const [sites, setSites] =
    useState<Site[]>([]);

  const [serviceRequests, setServiceRequests] =
    useState<ServiceRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadCustomerData() {
    setLoading(true);
    setError("");

    try {
      const [
        dashboardData,
        workOrderData,
        siteData,
        requestData
      ] = await Promise.all([
        apiRequest<CustomerDashboard>(
          "/customer/dashboard"
        ),

        apiRequest<WorkOrder[]>(
          "/customer/work-orders"
        ),

        apiRequest<Site[]>(
          "/sites/my"
        ),

        apiRequest<ServiceRequest[]>(
          "/customer/service-requests"
        )
      ]);

      setDashboard(dashboardData);
      setWorkOrders(workOrderData);
      setSites(siteData);
      setServiceRequests(requestData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customer data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomerData();
  }, []);

  const pageTitle =
    activePage === "dashboard"
      ? "Customer Dashboard"
      : activePage === "work-orders"
      ? "My Work Orders"
      : activePage === "sites"
      ? "My Sites"
      : "Service Requests";

  return (
    <main className="portal">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            KEYSTONE
          </div>

          <div className="sidebar-subtitle">
            Customer Portal
          </div>

          <nav className="navigation">
            <button
              className={
                activePage === "dashboard"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActivePage("dashboard")
              }
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              className={
                activePage === "work-orders"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActivePage("work-orders")
              }
            >
              <span>▣</span>
              Work Orders
            </button>

            <button
              className={
                activePage === "sites"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActivePage("sites")
              }
            >
              <span>⌖</span>
              My Sites
            </button>

            <button
              className={
                activePage === "requests"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActivePage("requests")
              }
            >
              <span>◫</span>
              Service Requests
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="customer-mini">
            <div className="avatar">
              {auth.fullName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {auth.fullName}
              </strong>

              <span>
                Customer
              </span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <span className="topbar-label">
              CUSTOMER PORTAL
            </span>

            <h1>{pageTitle}</h1>
          </div>

          <button
            className="refresh-button"
            onClick={loadCustomerData}
          >
            ↻ Refresh
          </button>
        </header>

        {loading && (
          <div className="loading-box">
            Loading customer portal...
          </div>
        )}

        {error && (
          <div className="error-box content-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {activePage === "dashboard" && (
              <CustomerDashboardPage
                dashboard={dashboard}
                workOrders={workOrders}
                serviceRequests={
                  serviceRequests
                }
                sites={sites}
              />
            )}

            {activePage === "work-orders" && (
              <WorkOrdersPage
                workOrders={workOrders}
              />
            )}

            {activePage === "sites" && (
            <SitesPage
             sites={sites}
            onCreated={loadCustomerData}
            />
            )}

            {activePage === "requests" && (
              <ServiceRequestsPage
                sites={sites}
                serviceRequests={
                  serviceRequests
                }
                onCreated={loadCustomerData}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   CUSTOMER DASHBOARD
========================================================= */

function CustomerDashboardPage({
  dashboard,
  workOrders,
  serviceRequests,
  sites
}: {
  dashboard: CustomerDashboard | null;
  workOrders: WorkOrder[];
  serviceRequests: ServiceRequest[];
  sites: Site[];
}) {
  if (!dashboard) {
    return (
      <div className="page-body">
        <EmptyState text="Dashboard data unavailable." />
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="welcome-card">
        <div>
          <span className="eyebrow">
            OVERVIEW
          </span>

          <h2>
            Your Service Overview
          </h2>

          <p>
            Monitor work orders, sites and service
            requests from one place.
          </p>
        </div>

        <div className="welcome-icon">
          ◆
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Work Orders"
          value={dashboard.totalWorkOrders}
          icon="▣"
        />

        <StatCard
          label="New Work Orders"
          value={dashboard.newWorkOrders}
          icon="＋"
        />

        <StatCard
          label="In Progress"
          value={dashboard.inProgressWorkOrders}
          icon="◷"
        />

        <StatCard
          label="Completed"
          value={dashboard.completedWorkOrders}
          icon="✓"
        />

        <StatCard
          label="Service Requests"
          value={dashboard.totalServiceRequests}
          icon="◫"
        />

        <StatCard
          label="My Sites"
          value={dashboard.totalSites}
          icon="⌖"
        />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Recent Work Orders
              </h3>

              <span>
                Latest service activity
              </span>
            </div>
          </div>

          {workOrders.length === 0 ? (
            <EmptyState text="No work orders found." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Site</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {workOrders
                    .slice(0, 5)
                    .map(
                      (workOrder) => (
                        <tr
                          key={
                            workOrder.id
                          }
                        >
                          <td>
                            #
                            {
                              workOrder.id
                            }
                          </td>

                          <td>
                            <strong>
                              {
                                workOrder.title
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              workOrder.siteName
                            }
                          </td>

                          <td>
                            <StatusBadge
                              status={
                                workOrder.status
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Service Requests
              </h3>

              <span>
                Your latest requests
              </span>
            </div>
          </div>

          {serviceRequests.length === 0 ? (
            <EmptyState text="No service requests found." />
          ) : (
            <div className="request-list">
              {serviceRequests
                .slice(0, 5)
                .map(
                  (request) => (
                    <div
                      className="request-item"
                      key={request.id}
                    >
                      <div className="request-icon">
                        ◫
                      </div>

                      <div className="request-info">
                        <strong>
                          {
                            request.title
                          }
                        </strong>

                        <span>
                          {
                            request.siteName
                          }
                        </span>
                      </div>

                      <StatusBadge
                        status={
                          request.status
                        }
                      />
                    </div>
                  )
                )}
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>
              My Sites
            </h3>

            <span>
              Sites associated with your account
            </span>
          </div>
        </div>

        <div className="site-grid">
          {sites.map(
            (site) => (
              <div
                className="site-card"
                key={site.id}
              >
                <div className="site-icon">
                  ⌖
                </div>

                <div>
                  <h4>
                    {site.name}
                  </h4>

                  <p>
                    {site.address}
                  </p>

                  <span>
                    {site.city},{" "}
                    {site.state}{" "}
                    {site.postalCode}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOMER WORK ORDERS
========================================================= */

function WorkOrdersPage({
  workOrders
}: {
  workOrders: WorkOrder[];
}) {
  const [selected, setSelected] =
    useState<WorkOrder | null>(null);

  return (
    <div className="page-body">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            SERVICE HISTORY
          </span>

          <h2>
            My Work Orders
          </h2>

          <p>
            Work orders associated with your customer
            account.
          </p>
        </div>

        <div className="count-pill">
          {workOrders.length} Work Orders
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Work Order
                </th>

                <th>
                  Title
                </th>

                <th>
                  Site
                </th>

                <th>
                  Technician
                </th>

                <th>
                  Status
                </th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {workOrders.map(
                (workOrder) => (
                  <tr
                    key={
                      workOrder.id
                    }
                  >
                    <td>
                      <strong>
                        #
                        {
                          workOrder.id
                        }
                      </strong>
                    </td>

                    <td>
                      {
                        workOrder.title
                      }
                    </td>

                    <td>
                      {
                        workOrder.siteName
                      }
                    </td>

                    <td>
                      {
                        workOrder.technicianName ||
                        "Not assigned"
                      }
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          workOrder.status
                        }
                      />
                    </td>

                    <td>
                      <button
                        className="small-button"
                        onClick={() =>
                          setSelected(
                            workOrder
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelected(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  WORK ORDER #
                  {selected.id}
                </span>

                <h2>
                  {selected.title}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelected(null)
                }
              >
                ×
              </button>
            </div>

            <div className="detail-grid">
              <Detail
                label="Status"
                value={
                  selected.status
                }
              />

              <Detail
                label="Site"
                value={
                  selected.siteName
                }
              />

              <Detail
                label="Technician"
                value={
                  selected.technicianName ||
                  "Not assigned"
                }
              />

              <Detail
                label="Scheduled"
                value={
                  selected.scheduledAt ||
                  "Not scheduled"
                }
              />

              <Detail
                label="SLA Status"
                value={
                  selected.slaStatus ||
                  "N/A"
                }
              />
            </div>

            <div className="description-box">
              <span>
                Description
              </span>

              <p>
                {
                  selected.description
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CUSTOMER SITES
========================================================= */

function SitesPage({
  sites,
  onCreated
}: {
  sites: Site[];
  onCreated: () => void;
}) {
  const [showAddSite, setShowAddSite] =
    useState(false);

  const [name, setName] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [postalCode, setPostalCode] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  function openAddSite() {
    setFormError("");
    setName("");
    setAddress("");
    setCity("");
    setState("");
    setPostalCode("");
    setShowAddSite(true);
  }

  function closeAddSite() {
    if (saving) {
      return;
    }

    setShowAddSite(false);
    setFormError("");
  }

  async function handleAddSite(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setFormError("");

    if (
      !name.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !postalCode.trim()
    ) {
      setFormError(
        "Please fill in all site details."
      );
      return;
    }

    setSaving(true);

    try {
      await apiRequest<Site>(
        "/sites/my",
        {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim()
          })
        }
      );

      setShowAddSite(false);

      setName("");
      setAddress("");
      setCity("");
      setState("");
      setPostalCode("");

      onCreated();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to add site. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-body">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            LOCATIONS
          </span>

          <h2>
            My Sites
          </h2>

          <p>
            Sites connected to your customer profile.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div className="count-pill">
            {sites.length} Sites
          </div>

          <button
            className="primary-button"
            onClick={openAddSite}
          >
            + Add Site
          </button>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            ⌖
          </div>

          <h3>
            No sites added yet
          </h3>

          <p>
            Add your first service location to
            get started.
          </p>

          <button
            className="primary-button"
            onClick={openAddSite}
          >
            + Add Site
          </button>
        </div>
      ) : (
        <div className="site-grid large">
          {sites.map(
            (site) => (
              <div
                className="site-card"
                key={site.id}
              >
                <div className="site-icon">
                  ⌖
                </div>

                <div>
                  <h3>
                    {site.name}
                  </h3>

                  <p>
                    {site.address}
                  </p>

                  <div className="site-meta">
                    <span>
                      {site.city}
                    </span>

                    <span>
                      {site.state}
                    </span>

                    <span>
                      {site.postalCode}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {showAddSite && (
        <div
          className="modal-backdrop"
          onClick={closeAddSite}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  LOCATIONS
                </span>

                <h2>
                  Add New Site
                </h2>

                <p>
                  Add a service location to your
                  customer account.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeAddSite}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="error-box">
                {formError}
              </div>
            )}

            <form
              onSubmit={handleAddSite}
            >
              <div className="form-grid">
                <div className="form-field full">
                  <label>
                    Site Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Main Office"
                    disabled={saving}
                  />
                </div>

                <div className="form-field full">
                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    value={address}
                    onChange={(event) =>
                      setAddress(
                        event.target.value
                      )
                    }
                    placeholder="Enter full address"
                    disabled={saving}
                  />
                </div>

                <div className="form-field">
                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(
                        event.target.value
                      )
                    }
                    placeholder="City"
                    disabled={saving}
                  />
                </div>

                <div className="form-field">
                  <label>
                    State
                  </label>

                  <input
                    type="text"
                    value={state}
                    onChange={(event) =>
                      setState(
                        event.target.value
                      )
                    }
                    placeholder="State"
                    disabled={saving}
                  />
                </div>

                <div className="form-field">
                  <label>
                    Postal Code
                  </label>

                  <input
                    type="text"
                    value={postalCode}
                    onChange={(event) =>
                      setPostalCode(
                        event.target.value
                      )
                    }
                    placeholder="Postal code"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAddSite}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Adding..."
                    : "Add Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
/* =========================================================
   SERVICE REQUESTS
========================================================= */

function ServiceRequestsPage({
  sites,
  serviceRequests,
  onCreated
}: {
  sites: Site[];
  serviceRequests: ServiceRequest[];
  onCreated: () => Promise<void>;
}) {
  const [showForm, setShowForm] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [siteId, setSiteId] =
    useState(
      sites[0]?.id?.toString() || ""
    );

  const [priority, setPriority] =
    useState("MEDIUM");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selected, setSelected] =
    useState<ServiceRequest | null>(
      null
    );

  async function createRequest(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await apiRequest<ServiceRequest>(
        "/customer/service-requests",
        {
          method: "POST",
          body: JSON.stringify({
            siteId: Number(siteId),
            title,
            description,
            priority
          })
        }
      );

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setShowForm(false);

      await onCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create service request"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-body">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            SUPPORT
          </span>

          <h2>
            Service Requests
          </h2>

          <p>
            Create and track maintenance requests.
          </p>
        </div>

        <button
          className="primary-button compact"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          {showForm
            ? "Close"
            : "+ New Request"}
        </button>
      </div>

      {showForm && (
        <section className="panel form-panel">
          <div className="panel-header">
            <div>
              <h3>
                Create Service Request
              </h3>

              <span>
                Submit a new request for one of your
                sites.
              </span>
            </div>
          </div>

          <form
            className="request-form"
            onSubmit={createRequest}
          >
            <label>
              Site

              <select
                value={siteId}
                onChange={(e) =>
                  setSiteId(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select site
                </option>

                {sites.map(
                  (site) => (
                    <option
                      key={site.id}
                      value={site.id}
                    >
                      {site.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Title

              <input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Describe the issue"
                required
              />
            </label>

            <label>
              Priority

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
              >
                <option value="LOW">
                  LOW
                </option>

                <option value="MEDIUM">
                  MEDIUM
                </option>

                <option value="HIGH">
                  HIGH
                </option>

                <option value="URGENT">
                  URGENT
                </option>
              </select>
            </label>

            <label className="full-width">
              Description

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Provide additional details..."
                rows={4}
              />
            </label>

            {error && (
              <div className="error-box full-width">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Submitting..."
                  : "Submit Request"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>
              My Requests
            </h3>

            <span>
              {serviceRequests.length} requests
            </span>
          </div>
        </div>

        {serviceRequests.length === 0 ? (
          <EmptyState text="No service requests found." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Site</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {serviceRequests.map(
                  (request) => (
                    <tr
                      key={
                        request.id
                      }
                    >
                      <td>
                        #
                        {
                          request.id
                        }
                      </td>

                      <td>
                        <strong>
                          {
                            request.title
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          request.siteName
                        }
                      </td>

                      <td>
                        <PriorityBadge
                          priority={
                            request.priority
                          }
                        />
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            request.status
                          }
                        />
                      </td>

                      <td>
                        <button
                          className="small-button"
                          onClick={() =>
                            setSelected(
                              request
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelected(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  SERVICE REQUEST #
                  {selected.id}
                </span>

                <h2>
                  {selected.title}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelected(null)
                }
              >
                ×
              </button>
            </div>

            <div className="detail-grid">
              <Detail
                label="Site"
                value={
                  selected.siteName
                }
              />

              <Detail
                label="Priority"
                value={
                  selected.priority
                }
              />

              <Detail
                label="Status"
                value={
                  selected.status
                }
              />

              <Detail
                label="Created"
                value={
                  selected.createdAt
                }
              />
            </div>

            <div className="description-box">
              <span>
                Description
              </span>

              <p>
                {
                  selected.description ||
                  "No description provided."
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MANAGER / DISPATCHER / TECHNICIAN WORKSPACE
========================================================= */

type RolePage =
  | "home"
  | "dashboard"
  | "profile"
  | "users"
  | "operations"
  | "work-orders"
  | "service-requests"
  | "technicians"
  | "assigned";

function RoleDashboard({
  auth,
  logout
}: {
  auth: Auth;
  logout: () => void;
}) {
  const [activePage, setActivePage] =
    useState<RolePage>("home");

  const [managerDashboard, setManagerDashboard] =
    useState<ManagerDashboard | null>(null);

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  const [dashboardError, setDashboardError] =
    useState("");

  const [users, setUsers] =
    useState<User[]>([]);

  const [usersLoading, setUsersLoading] =
    useState(false);

  const [usersError, setUsersError] =
    useState("");
   
  const [creatingWorkOrderId, setCreatingWorkOrderId] =
  useState<number | null>(null);

  const [createWorkOrderError, setCreateWorkOrderError] =
  useState("");

  const [showAddUserModal, setShowAddUserModal] =
  useState(false);

  const [newUserFullName, setNewUserFullName] =
  useState("");

  const [newUserEmail, setNewUserEmail] =
  useState("");

  const [newUserPassword, setNewUserPassword] =
  useState("");

  const [newUserRole, setNewUserRole] =
  useState<
    "MANAGER" |
    "DISPATCHER" |
    "TECHNICIAN"
  >("TECHNICIAN");

  const [newUserActive, setNewUserActive] =
  useState(true);

  const [creatingUser, setCreatingUser] =
  useState(false);

  const [createUserError, setCreateUserError] =
  useState("");
  /* =========================================================
     TECHNICIAN MANAGEMENT STATE
  ========================================================= */

  const [technicians, setTechnicians] =
    useState<User[]>([]);

  const [techniciansLoading, setTechniciansLoading] =
    useState(false);

  const [techniciansError, setTechniciansError] =
    useState("");

  /* =========================================================
     WORK ORDER MANAGEMENT STATE
  ========================================================= */

  const [workOrders, setWorkOrders] =
    useState<WorkOrder[]>([]);

  const [workOrdersLoading, setWorkOrdersLoading] =
    useState(false);

  const [workOrdersError, setWorkOrdersError] =
    useState("");

  /* =========================================================
     DISPATCHER SERVICE REQUEST STATE
  ========================================================= */

  const [serviceRequests, setServiceRequests] =
    useState<ServiceRequest[]>([]);

  const [serviceRequestsLoading, setServiceRequestsLoading] =
    useState(false);

  const [serviceRequestsError, setServiceRequestsError] =
    useState("");

  const [selectedServiceRequest, setSelectedServiceRequest] =
    useState<ServiceRequest | null>(null);

  const [assigningWorkOrderId, setAssigningWorkOrderId] =
    useState<number | null>(null);

  const [assignmentError, setAssignmentError] =
    useState("");

  /* =========================================================
     TECHNICIAN ASSIGNED WORK ORDER STATE
  ========================================================= */

  const [assignedWorkOrders, setAssignedWorkOrders] =
    useState<WorkOrder[]>([]);

  const [assignedLoading, setAssignedLoading] =
    useState(false);

  const [assignedError, setAssignedError] =
    useState("");

  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  const [statusUpdateError, setStatusUpdateError] =
    useState("");

  /* =========================================================
     LOAD USERS
  ========================================================= */

  async function loadUsers() {
    setUsersLoading(true);
    setUsersError("");

    try {
      const data =
        await apiRequest<User[]>(
          "/users"
        );

      setUsers(data);
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : "Unable to load users"
      );
    } finally {
      setUsersLoading(false);
    }
  }

  async function createUser() {
  setCreateUserError("");

  if (!newUserFullName.trim()) {
    setCreateUserError("Full name is required.");
    return;
  }

  if (!newUserEmail.trim()) {
    setCreateUserError("Email is required.");
    return;
  }

  if (!newUserPassword) {
    setCreateUserError("Password is required.");
    return;
  }

  if (newUserPassword.length < 6) {
    setCreateUserError(
      "Password must be at least 6 characters."
    );
    return;
  }

  setCreatingUser(true);

  try {
    await apiRequest<User>("/users", {
      method: "POST",
      body: JSON.stringify({
        fullName: newUserFullName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
        active: newUserActive
      })
    });

    setShowAddUserModal(false);

    setNewUserFullName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("TECHNICIAN");
    setNewUserActive(true);
    setCreateUserError("");

    await loadUsers();
  } catch (error) {
    setCreateUserError(
      error instanceof Error
        ? error.message
        : "Unable to create user."
    );
  } finally {
    setCreatingUser(false);
  }
}

  /* =========================================================
     LOAD TECHNICIANS
  ========================================================= */

  async function loadTechnicians() {
    setTechniciansLoading(true);
    setTechniciansError("");

    try {
      const data =
        await apiRequest<User[]>(
          "/technicians"
        );

      setTechnicians(data);
    } catch (error) {
      setTechniciansError(
        error instanceof Error
          ? error.message
          : "Unable to load technicians"
      );
    } finally {
      setTechniciansLoading(false);
    }
  }

  /* =========================================================
     LOAD MANAGER DASHBOARD
  ========================================================= */

  async function loadManagerDashboard() {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      const data =
        await apiRequest<ManagerDashboard>(
          "/dashboard"
        );

      setManagerDashboard(data);
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard"
      );
    } finally {
      setDashboardLoading(false);
    }
  }

  /* =========================================================
     LOAD WORK ORDERS
  ========================================================= */

  async function loadWorkOrders() {
    setWorkOrdersLoading(true);
    setWorkOrdersError("");
    setAssignmentError("");

    try {
      const data =
        await apiRequest<WorkOrder[]>(
          "/work-orders"
        );

      setWorkOrders(data);
    } catch (error) {
      setWorkOrdersError(
        error instanceof Error
          ? error.message
          : "Unable to load work orders"
      );
    } finally {
      setWorkOrdersLoading(false);
    }
  }

  /* =========================================================
     LOAD DISPATCHER SERVICE REQUESTS
  ========================================================= */

  async function loadServiceRequests() {
    if (auth.role !== "DISPATCHER") {
      return;
    }

    setServiceRequestsLoading(true);
    setServiceRequestsError("");

    try {
      const data =
        await apiRequest<ServiceRequest[]>(
          "/dispatcher/service-requests"
        );

      setServiceRequests(data);
    } catch (error) {
      setServiceRequestsError(
        error instanceof Error
          ? error.message
          : "Unable to load service requests"
      );
    } finally {
      setServiceRequestsLoading(false);
    }
  }

  /* =========================================================
     ASSIGN TECHNICIAN
  ========================================================= */

  async function assignTechnician(
    workOrderId: number,
    technicianId: number
  ) {
    setAssigningWorkOrderId(workOrderId);
    setAssignmentError("");

    try {
      await apiRequest<WorkOrder>(
        `/work-orders/${workOrderId}/assign/${technicianId}`,
        {
          method: "POST"
        }
      );

      await loadWorkOrders();
    } catch (error) {
      setAssignmentError(
        error instanceof Error
          ? error.message
          : "Unable to assign technician"
      );
    } finally {
      setAssigningWorkOrderId(null);
    }
  }

  /* =========================================================
     LOAD ASSIGNED WORK ORDERS
  ========================================================= */

  async function loadAssignedWorkOrders() {
    setAssignedLoading(true);
    setAssignedError("");
    setStatusUpdateError("");

    try {
      const data =
        await apiRequest<WorkOrder[]>(
          "/technicians/me/work-orders"
        );

      setAssignedWorkOrders(data);
    } catch (error) {
      setAssignedError(
        error instanceof Error
          ? error.message
          : "Unable to load assigned work orders"
      );
    } finally {
      setAssignedLoading(false);
    }
  }

  /* =========================================================
     UPDATE WORK ORDER STATUS
  ========================================================= */

  async function updateWorkOrderStatus(
    workOrderId: number,
    status: string
  ) {
    setUpdatingStatusId(workOrderId);
    setStatusUpdateError("");

    try {
      await apiRequest<WorkOrder>(
        `/work-orders/${workOrderId}/status/${status}`,
        {
          method: "POST"
        }
      );

      await loadAssignedWorkOrders();
    } catch (error) {
      setStatusUpdateError(
        error instanceof Error
          ? error.message
          : "Unable to update work order status"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  /* =========================================================
     OPEN PAGE
  ========================================================= */

  function openPage(page: RolePage) {
    setActivePage(page);

    if (
      page === "dashboard" &&
      (auth.role === "MANAGER" ||
        auth.role === "DISPATCHER")
    ) {
      loadManagerDashboard();
    }

    if (
      page === "users" &&
      auth.role === "MANAGER"
    ) {
      loadUsers();
    }

    if (
      page === "technicians" &&
      (auth.role === "MANAGER" ||
        auth.role === "DISPATCHER")
    ) {
      loadTechnicians();
    }

    if (
      page === "work-orders" &&
      (auth.role === "MANAGER" ||
        auth.role === "DISPATCHER")
    ) {
      loadWorkOrders();

      if (technicians.length === 0) {
        loadTechnicians();
      }
    }

    if (
      page === "service-requests" &&
      auth.role === "DISPATCHER"
    ) {
      loadServiceRequests();
    }

    if (
      page === "assigned" &&
      auth.role === "TECHNICIAN"
    ) {
      loadAssignedWorkOrders();
    }
  }

  /* =========================================================
     HOME
  ========================================================= */

  function renderHome() {
    return (
      <>
        <span className="eyebrow">
          {auth.role}
        </span>

        <h1>
          Welcome, {auth.fullName}
        </h1>

        <p>
          Protected{" "}
          {auth.role.toLowerCase()}{" "}
          workspace.
        </p>

        <div className="role-grid">

          {/* DASHBOARD */}

          <div
            className="role-card"
            onClick={() =>
              openPage("dashboard")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                openPage("dashboard");
              }
            }}
          >
            <strong>
              Dashboard
            </strong>

            <span>
              Role-based workspace
            </span>
          </div>

          {/* PROFILE */}

          <div
            className="role-card"
            onClick={() =>
              openPage("profile")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                openPage("profile");
              }
            }}
          >
            <strong>
              Profile
            </strong>

            <span>
              Manage profile information
            </span>
          </div>

          {/* DISPATCHER */}

          {auth.role === "DISPATCHER" && (
            <>
              <div
                className="role-card"
                onClick={() =>
                  openPage(
                    "work-orders"
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    openPage(
                      "work-orders"
                    );
                  }
                }}
              >
                <strong>
                  Work Orders
                </strong>

                <span>
                  Create, manage and assign
                </span>
              </div>

              <div
                className="role-card"
                onClick={() =>
                  openPage(
                    "technicians"
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    openPage(
                      "technicians"
                    );
                  }
                }}
              >
                <strong>
                  Technicians
                </strong>

                <span>
                  Workload and availability
                </span>
              </div>

              <div
                className="role-card"
                onClick={() =>
                  openPage(
                    "service-requests"
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    openPage(
                      "service-requests"
                    );
                  }
                }}
              >
                <strong>
                  Service Requests
                </strong>

                <span>
                  Review customer service requests
                </span>
              </div>
            </>
          )}

          {/* TECHNICIAN */}

          {auth.role === "TECHNICIAN" && (
            <div
              className="role-card"
              onClick={() =>
                openPage("assigned")
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key === " "
                ) {
                  openPage("assigned");
                }
              }}
            >
              <strong>
                Assigned Work Orders
              </strong>

              <span>
                Start, update and complete jobs
              </span>
            </div>
          )}

          {/* MANAGER */}

          {auth.role === "MANAGER" && (
            <>
              <div
                className="role-card"
                onClick={() =>
                  openPage("users")
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    openPage("users");
                  }
                }}
              >
                <strong>
                  Users
                </strong>

                <span>
                  Manage platform users
                </span>
              </div>

              <div
                className="role-card"
                onClick={() =>
                  openPage(
                    "operations"
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    openPage(
                      "operations"
                    );
                  }
                }}
              >
                <strong>
                  Operations
                </strong>

                <span>
                  Monitor field service
                </span>
              </div>

              <div
                className="role-card"
                onClick={() =>
                  openPage(
                    "work-orders"
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    openPage(
                      "work-orders"
                    );
                  }
                }}
              >
                <strong>
                  Work Orders
                </strong>

                <span>
                  Manage and assign work
                </span>
              </div>

              <div
                className="role-card"
                onClick={() =>
                  openPage(
                    "technicians"
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    openPage(
                      "technicians"
                    );
                  }
                }}
              >
                <strong>
                  Technicians
                </strong>

                <span>
                  View technician availability
                </span>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  /* =========================================================
       DASHBOARD
    ========================================================= */

    function renderDashboard() {
    if (
      auth.role !== "MANAGER" &&
      auth.role !== "DISPATCHER"
    ) {
      return (
        <RoleMessage
          title="Dashboard"
          message="Dashboard is not available for this role."
        />
      );
    }

    if (dashboardLoading) {
      return (
        <div className="page-body">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <span>Loading dashboard...</span>
          </div>
        </div>
      );
    }

    if (dashboardError) {
      return (
        <div className="page-body">
          <div className="dashboard-error">
            <div className="dashboard-error-icon">!</div>
            <div>
              <strong>Unable to load dashboard</strong>
              <p>{dashboardError}</p>
            </div>
            <button
              className="primary-button compact"
              onClick={loadManagerDashboard}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!managerDashboard) {
      return (
        <div className="page-body">
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">◷</div>

            <h3>Dashboard data unavailable</h3>

            <p>
              Refresh the dashboard to load the latest
              field service statistics.
            </p>

            <button
              className="primary-button"
              onClick={loadManagerDashboard}
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }

    const d = managerDashboard;

    const totalWorkOrders =
      d.totalWorkOrders || 0;

    const totalSla =
      d.onTimeSla +
      d.atRiskSla +
      d.breachedSla;

    const onTimePercent =
      totalSla > 0
        ? Math.round((d.onTimeSla / totalSla) * 100)
        : 0;

    const atRiskPercent =
      totalSla > 0
        ? Math.round((d.atRiskSla / totalSla) * 100)
        : 0;

    const breachedPercent =
      totalSla > 0
        ? Math.round((d.breachedSla / totalSla) * 100)
        : 0;

    const newPercent =
      totalWorkOrders > 0
        ? Math.round(
            (d.newWorkOrders / totalWorkOrders) * 100
          )
        : 0;

    const assignedPercent =
      totalWorkOrders > 0
        ? Math.round(
            (d.assignedWorkOrders / totalWorkOrders) * 100
          )
        : 0;

    const progressPercent =
      totalWorkOrders > 0
        ? Math.round(
            (d.inProgressWorkOrders / totalWorkOrders) * 100
          )
        : 0;

    const completedPercent =
      totalWorkOrders > 0
        ? Math.round(
            (d.completedWorkOrders / totalWorkOrders) * 100
          )
        : 0;

    const technicianPercent =
      d.totalTechnicians > 0
        ? Math.round(
            (d.activeTechnicians / d.totalTechnicians) * 100
          )
        : 0;

    return (
      <div className="page-body manager-dashboard">

        {/* =====================================================
            DASHBOARD HERO
        ====================================================== */}

        <section className="manager-hero">

          <div className="manager-hero-content">
            <span className="manager-eyebrow">
              OPERATIONS CENTER
            </span>

            <h1>Manager Dashboard</h1>

            <p>
              Monitor work orders, SLA performance,
              technician capacity and inventory.
            </p>
          </div>

          <div className="manager-hero-actions">
            <div className="dashboard-live">
              <span className="live-dot"></span>
              Live Data
            </div>

            <button
              className="dashboard-refresh-button"
              onClick={loadManagerDashboard}
              disabled={dashboardLoading}
            >
              <span className="refresh-symbol">↻</span>
              Refresh
            </button>
          </div>

        </section>


        {/* =====================================================
            KPI SECTION
        ====================================================== */}

        <section className="manager-kpi-grid">

          <div className="manager-kpi primary">

            <div className="manager-kpi-top">
              <span>Total Work Orders</span>

              <div className="manager-kpi-icon">
                ▣
              </div>
            </div>

            <strong>{d.totalWorkOrders}</strong>

            <span className="manager-kpi-caption">
              All service work orders
            </span>

          </div>


          <div className="manager-kpi">

            <div className="manager-kpi-top">
              <span>New</span>

              <div className="manager-kpi-icon">
                ＋
              </div>
            </div>

            <strong>{d.newWorkOrders}</strong>

            <span className="manager-kpi-caption">
              Awaiting assignment
            </span>

          </div>


          <div className="manager-kpi">

            <div className="manager-kpi-top">
              <span>Assigned</span>

              <div className="manager-kpi-icon">
                →
              </div>
            </div>

            <strong>{d.assignedWorkOrders}</strong>

            <span className="manager-kpi-caption">
              Technician assigned
            </span>

          </div>


          <div className="manager-kpi">

            <div className="manager-kpi-top">
              <span>In Progress</span>

              <div className="manager-kpi-icon">
                ◷
              </div>
            </div>

            <strong>{d.inProgressWorkOrders}</strong>

            <span className="manager-kpi-caption">
              Currently active
            </span>

          </div>


          <div className="manager-kpi success">

            <div className="manager-kpi-top">
              <span>Completed</span>

              <div className="manager-kpi-icon">
                ✓
              </div>
            </div>

            <strong>{d.completedWorkOrders}</strong>

            <span className="manager-kpi-caption">
              Successfully completed
            </span>

          </div>

        </section>


        {/* =====================================================
            ANALYTICS ROW
        ====================================================== */}

        <section className="manager-analytics-grid">

          {/* WORK ORDER PIPELINE */}

          <div className="manager-panel">

            <div className="manager-panel-header">

              <div>
                <span className="panel-eyebrow">
                  WORK ORDERS
                </span>

                <h3>Work Order Pipeline</h3>

                <p>
                  Current distribution across workflow stages.
                </p>
              </div>

              <div className="panel-total">
                <strong>{d.totalWorkOrders}</strong>
                <span>Total</span>
              </div>

            </div>


            <div className="pipeline-list">

              <div className="pipeline-row">

                <div className="pipeline-label">
                  <div className="pipeline-name">
                    <span className="pipeline-dot new"></span>
                    New
                  </div>

                  <strong>{d.newWorkOrders}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill new"
                    style={{
                      width: `${newPercent}%`
                    }}
                  ></div>
                </div>

                <span className="progress-percent">
                  {newPercent}%
                </span>

              </div>


              <div className="pipeline-row">

                <div className="pipeline-label">
                  <div className="pipeline-name">
                    <span className="pipeline-dot assigned"></span>
                    Assigned
                  </div>

                  <strong>{d.assignedWorkOrders}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill assigned"
                    style={{
                      width: `${assignedPercent}%`
                    }}
                  ></div>
                </div>

                <span className="progress-percent">
                  {assignedPercent}%
                </span>

              </div>


              <div className="pipeline-row">

                <div className="pipeline-label">
                  <div className="pipeline-name">
                    <span className="pipeline-dot progress"></span>
                    In Progress
                  </div>

                  <strong>{d.inProgressWorkOrders}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill progress"
                    style={{
                      width: `${progressPercent}%`
                    }}
                  ></div>
                </div>

                <span className="progress-percent">
                  {progressPercent}%
                </span>

              </div>


              <div className="pipeline-row">

                <div className="pipeline-label">
                  <div className="pipeline-name">
                    <span className="pipeline-dot completed"></span>
                    Completed
                  </div>

                  <strong>{d.completedWorkOrders}</strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill completed"
                    style={{
                      width: `${completedPercent}%`
                    }}
                  ></div>
                </div>

                <span className="progress-percent">
                  {completedPercent}%
                </span>

              </div>

            </div>

          </div>


          {/* SLA PERFORMANCE */}

          <div className="manager-panel">

            <div className="manager-panel-header">

              <div>
                <span className="panel-eyebrow">
                  SERVICE LEVEL
                </span>

                <h3>SLA Performance</h3>

                <p>
                  Current service-level compliance.
                </p>
              </div>

              <div className="sla-score">
                <strong>{onTimePercent}%</strong>
                <span>On Time</span>
              </div>

            </div>


            <div className="sla-list">

              <div className="sla-row">

                <div className="sla-row-top">

                  <div className="sla-title">
                    <span className="sla-status-icon on-time">
                      ✓
                    </span>

                    <div>
                      <strong>On Time</strong>
                      <span>Within SLA target</span>
                    </div>
                  </div>

                  <strong className="sla-number">
                    {d.onTimeSla}
                  </strong>

                </div>

                <div className="sla-progress">
                  <div
                    className="sla-progress-fill on-time"
                    style={{
                      width: `${onTimePercent}%`
                    }}
                  ></div>
                </div>

                <span className="sla-percent">
                  {onTimePercent}%
                </span>

              </div>


              <div className="sla-row">

                <div className="sla-row-top">

                  <div className="sla-title">
                    <span className="sla-status-icon at-risk">
                      ◷
                    </span>

                    <div>
                      <strong>At Risk</strong>
                      <span>Deadline approaching</span>
                    </div>
                  </div>

                  <strong className="sla-number">
                    {d.atRiskSla}
                  </strong>

                </div>

                <div className="sla-progress">
                  <div
                    className="sla-progress-fill at-risk"
                    style={{
                      width: `${atRiskPercent}%`
                    }}
                  ></div>
                </div>

                <span className="sla-percent">
                  {atRiskPercent}%
                </span>

              </div>


              <div className="sla-row">

                <div className="sla-row-top">

                  <div className="sla-title">
                    <span className="sla-status-icon breached">
                      !
                    </span>

                    <div>
                      <strong>Breached</strong>
                      <span>SLA deadline exceeded</span>
                    </div>
                  </div>

                  <strong className="sla-number">
                    {d.breachedSla}
                  </strong>

                </div>

                <div className="sla-progress">
                  <div
                    className="sla-progress-fill breached"
                    style={{
                      width: `${breachedPercent}%`
                    }}
                  ></div>
                </div>

                <span className="sla-percent">
                  {breachedPercent}%
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            RESOURCE OVERVIEW
        ====================================================== */}

        <section className="manager-resource-grid">

          {/* TECHNICIANS */}

          <div className="resource-card">

            <div className="resource-card-header">

              <div className="resource-icon technician">
                ♙
              </div>

              <div>
                <span className="panel-eyebrow">
                  WORKFORCE
                </span>

                <h3>Technician Capacity</h3>
              </div>

            </div>


            <div className="technician-summary">

              <div className="technician-main">
                <strong>
                  {d.activeTechnicians}
                </strong>

                <span>
                  Active technicians
                </span>
              </div>

              <div className="technician-total">
                <strong>
                  {d.totalTechnicians}
                </strong>

                <span>
                  Total
                </span>
              </div>

            </div>


            <div className="capacity-progress">

              <div className="capacity-progress-top">
                <span>Current availability</span>
                <strong>{technicianPercent}%</strong>
              </div>

              <div className="progress-track large">
                <div
                  className="progress-fill technician"
                  style={{
                    width: `${technicianPercent}%`
                  }}
                ></div>
              </div>

            </div>


            <div className="resource-footer">
              <span className="status-indicator active"></span>
              {d.activeTechnicians} technicians currently active
            </div>

          </div>


          {/* INVENTORY */}

          <div className="resource-card">

            <div className="resource-card-header">

              <div className="resource-icon inventory">
                □
              </div>

              <div>
                <span className="panel-eyebrow">
                  INVENTORY
                </span>

                <h3>Parts Overview</h3>
              </div>

            </div>


            <div className="inventory-metrics">

              <div className="inventory-metric">

                <span>Total Parts</span>

                <strong>
                  {d.totalParts}
                </strong>

              </div>


              <div className="inventory-divider"></div>


              <div className="inventory-metric warning">

                <span>Low Stock</span>

                <strong>
                  {d.lowStockParts}
                </strong>

              </div>

            </div>


            <div className="inventory-status">

              <div className="inventory-status-icon">
                {d.lowStockParts > 0 ? "!" : "✓"}
              </div>

              <div>
                <strong>
                  {d.lowStockParts > 0
                    ? "Inventory attention required"
                    : "Inventory levels are healthy"}
                </strong>

                <span>
                  {d.lowStockParts > 0
                    ? `${d.lowStockParts} part(s) currently low in stock.`
                    : "No low-stock parts reported."}
                </span>
              </div>

            </div>

          </div>


          {/* PRODUCTIVITY */}

          <div className="resource-card">

            <div className="resource-card-header">

              <div className="resource-icon productivity">
                ◴
              </div>

              <div>
                <span className="panel-eyebrow">
                  PRODUCTIVITY
                </span>

                <h3>Logged Work Time</h3>
              </div>

            </div>


            <div className="productivity-value">

              <strong>
                {d.totalLoggedMinutes}
              </strong>

              <span>minutes logged</span>

            </div>


            <div className="productivity-meta">

              <div>
                <span>Work orders</span>
                <strong>{d.totalWorkOrders}</strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>{d.completedWorkOrders}</strong>
              </div>

            </div>


            <div className="resource-footer">
              <span className="status-indicator blue"></span>
              Live productivity tracking
            </div>

          </div>

        </section>


        {/* =====================================================
            BOTTOM SUMMARY
        ====================================================== */}

        <section className="manager-summary-bar">

          <div className="summary-item">

            <div className="summary-icon">
              ✓
            </div>

            <div>
              <span>Completed Work Orders</span>
              <strong>{d.completedWorkOrders}</strong>
            </div>

          </div>


          <div className="summary-divider"></div>


          <div className="summary-item">

            <div className="summary-icon warning">
              ◷
            </div>

            <div>
              <span>SLA At Risk</span>
              <strong>{d.atRiskSla}</strong>
            </div>

          </div>


          <div className="summary-divider"></div>


          <div className="summary-item">

            <div className="summary-icon danger">
              !
            </div>

            <div>
              <span>SLA Breached</span>
              <strong>{d.breachedSla}</strong>
            </div>

          </div>


          <div className="summary-divider"></div>


          <div className="summary-item">

            <div className="summary-icon blue">
              ♙
            </div>

            <div>
              <span>Active Technicians</span>
              <strong>
                {d.activeTechnicians}/{d.totalTechnicians}
              </strong>
            </div>

          </div>

        </section>

      </div>
    );
  }

    /* =========================================================
       USERS
    ========================================================= */

   function renderUsers() {
  if (auth.role !== "MANAGER") {
    return (
      <RoleMessage
        title="User Management"
        message="User management is available only to managers."
      />
    );
  }

  if (usersLoading) {
    return (
      <div className="page-body">
        <div className="loading-box">
          Loading users...
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="page-body">
        <div className="error-box">
          {usersError}
        </div>

        <button
          className="primary-button compact"
          onClick={loadUsers}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            ADMINISTRATION
          </span>

          <h2>
            User Management
          </h2>

          <p>
            Manage KEYSTONE platform users and roles.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center"
          }}
        >
          <button
            className="small-button"
            onClick={loadUsers}
          >
            ↻ Refresh
          </button>

          <button
            className="primary-button"
            onClick={() => {
              setCreateUserError("");
              setShowAddUserModal(true);
            }}
          >
            + Add User
          </button>
        </div>
      </div>

      {createUserError &&
        !showAddUserModal && (
          <div className="error-box content-error">
            {createUserError}
          </div>
        )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>
              Users
            </h3>

            <span>
              {users.length} platform users
            </span>
          </div>
        </div>

        {users.length === 0 ? (
          <EmptyState text="No users found." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    User
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Access
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>
                        {user.fullName}
                      </strong>
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      <StatusBadge
                        status={user.role}
                      />
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          user.active
                            ? "ACTIVE"
                            : "INACTIVE"
                        }
                      />
                    </td>

                    <td>
                      {user.role === "MANAGER"
                        ? "Full platform access"
                        : user.role === "DISPATCHER"
                        ? "Operations access"
                        : user.role === "TECHNICIAN"
                        ? "Assigned jobs access"
                        : "Customer portal access"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showAddUserModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  USER MANAGEMENT
                </span>

                <h3>
                  Add New User
                </h3>
              </div>

              <button
                className="small-button"
                onClick={() => {
                  setShowAddUserModal(false);
                  setCreateUserError("");
                }}
                disabled={creatingUser}
              >
                ✕
              </button>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={newUserFullName}
                  onChange={(event) =>
                    setNewUserFullName(
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  disabled={creatingUser}
                />
              </div>

              <div className="form-field">
                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(event) =>
                    setNewUserEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter email address"
                  disabled={creatingUser}
                />
              </div>

              <div className="form-field">
                <label>
                  Password
                </label>

                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(event) =>
                    setNewUserPassword(
                      event.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  disabled={creatingUser}
                />
              </div>

              <div className="form-field">
  <label>
    Role
  </label>

  <select
    value={newUserRole}
    onChange={(event) =>
      setNewUserRole(
        event.target.value as
          | "MANAGER"
          | "DISPATCHER"
          | "TECHNICIAN"
      )
    }
    disabled={creatingUser}
  >
    <option value="MANAGER">
      Manager
    </option>

    <option value="DISPATCHER">
      Dispatcher
    </option>

    <option value="TECHNICIAN">
      Technician
    </option>
  </select>
</div>

              <div className="form-field">
                <label>
                  Status
                </label>

                <select
                  value={
                    newUserActive
                      ? "ACTIVE"
                      : "INACTIVE"
                  }
                  onChange={(event) =>
                    setNewUserActive(
                      event.target.value ===
                        "ACTIVE"
                    )
                  }
                  disabled={creatingUser}
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            {createUserError && (
              <div className="error-box content-error">
                {createUserError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px"
              }}
            >
              <button
                className="small-button"
                onClick={() => {
                  setShowAddUserModal(false);
                  setCreateUserError("");
                }}
                disabled={creatingUser}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={createUser}
                disabled={creatingUser}
              >
                {creatingUser
                  ? "Creating..."
                  : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
    /* =========================================================
       DISPATCHER SERVICE REQUESTS
    ========================================================= */
  function renderServiceRequests() {
  if (auth.role !== "DISPATCHER") {
    return (
      <RoleMessage
        title="Service Requests"
        message="Service request management is available only to dispatchers."
      />
    );
  }

  if (serviceRequestsLoading) {
    return (
      <div className="page-body">
        <div className="loading-box">
          Loading service requests...
        </div>
      </div>
    );
  }

  if (serviceRequestsError) {
    return (
      <div className="page-body">
        <div className="error-box">
          {serviceRequestsError}
        </div>

        <button
          className="primary-button compact"
          onClick={loadServiceRequests}
        >
          Retry
        </button>
      </div>
    );
  }

  const newRequests = serviceRequests.filter(
    (request) => request.status === "NEW"
  );

  /*
   * CREATE WORK ORDER FROM SERVICE REQUEST
   */
  async function createWorkOrderFromRequest(
    request: ServiceRequest
  ) {
    if (!request.customerId || !request.siteId) {
      setCreateWorkOrderError(
        "Customer or site information is missing from this service request."
      );
      return;
    }

    const confirmed = window.confirm(
      `Create a Work Order for "${request.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setCreatingWorkOrderId(request.id);
    setCreateWorkOrderError("");

    try {
      await apiRequest(
        "/work-orders",
        {
          method: "POST",
          body: JSON.stringify({
            customerId: request.customerId,
            siteId: request.siteId,
            title: request.title,
            description:
              request.description || "",
            scheduledAt: null
          })
        }
      );

      /*
       * Refresh Work Orders so the newly created
       * work order is immediately available.
       */
      await loadWorkOrders();

      /*
       * Close service request modal if open.
       */
      setSelectedServiceRequest(null);

      /*
       * Move dispatcher directly to Work Orders.
       */
      setActivePage("work-orders");

    } catch (error) {
      setCreateWorkOrderError(
        error instanceof Error
          ? error.message
          : "Unable to create work order."
      );
    } finally {
      setCreatingWorkOrderId(null);
    }
  }

  return (
    <div className="page-body">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            CUSTOMER SUPPORT
          </span>

          <h2>
            Service Requests
          </h2>

          <p>
            Review customer service requests before
            they move into field service operations.
          </p>
        </div>

        <button
          className="small-button"
          onClick={loadServiceRequests}
        >
          ↻ Refresh
        </button>
      </div>

      {createWorkOrderError && (
        <div className="error-box content-error">
          {createWorkOrderError}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          label="Total Requests"
          value={serviceRequests.length}
          icon="◫"
        />

        <StatCard
          label="New Requests"
          value={newRequests.length}
          icon="＋"
        />
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>
              Customer Request Queue
            </h3>

            <span>
              {serviceRequests.length} requests received
            </span>
          </div>
        </div>

        {serviceRequests.length === 0 ? (
          <EmptyState
            text="No customer service requests found."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Request
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Site
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {serviceRequests.map(
                  (request) => {
                    const isCreating =
                      creatingWorkOrderId ===
                      request.id;

                    return (
                      <tr
                        key={request.id}
                      >
                        <td>
                          <strong>
                            #{request.id}
                          </strong>

                          <div
                            style={{
                              marginTop: "4px",
                              fontSize: "13px",
                              opacity: 0.78
                            }}
                          >
                            {request.title}
                          </div>
                        </td>

                        <td>
                          {request.customerName}
                        </td>

                        <td>
                          {request.siteName}
                        </td>

                        <td>
                          <PriorityBadge
                            priority={
                              request.priority
                            }
                          />
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              request.status
                            }
                          />
                        </td>

                        <td>
                          {new Date(
                            request.createdAt
                          ).toLocaleString()}
                        </td>

                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              minWidth: "245px",
                              flexWrap: "wrap"
                            }}
                          >
                            <button
                              className="small-button"
                              onClick={() =>
                                setSelectedServiceRequest(
                                  request
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              className="primary-button compact"
                              disabled={
                                isCreating
                              }
                              onClick={() =>
                                createWorkOrderFromRequest(
                                  request
                                )
                              }
                            >
                              {isCreating
                                ? "Creating..."
                                : "Create Work Order"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedServiceRequest && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setSelectedServiceRequest(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  SERVICE REQUEST #
                  {selectedServiceRequest.id}
                </span>

                <h2>
                  {selectedServiceRequest.title}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedServiceRequest(null)
                }
              >
                ×
              </button>
            </div>

            <div className="detail-grid">
              <Detail
                label="Customer"
                value={
                  selectedServiceRequest.customerName
                }
              />

              <Detail
                label="Site"
                value={
                  selectedServiceRequest.siteName
                }
              />

              <Detail
                label="Priority"
                value={
                  selectedServiceRequest.priority
                }
              />

              <Detail
                label="Status"
                value={
                  selectedServiceRequest.status
                }
              />

              <Detail
                label="Created"
                value={new Date(
                  selectedServiceRequest.createdAt
                ).toLocaleString()}
              />
            </div>

            <div className="description-box">
              <span>
                Customer Description
              </span>

              <p>
                {selectedServiceRequest.description ||
                  "No description provided."}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "22px",
                flexWrap: "wrap"
              }}
            >
              <button
                className="small-button"
                onClick={() =>
                  setSelectedServiceRequest(null)
                }
              >
                Close
              </button>

              <button
                className="primary-button"
                disabled={
                  creatingWorkOrderId ===
                  selectedServiceRequest.id
                }
                onClick={() =>
                  createWorkOrderFromRequest(
                    selectedServiceRequest
                  )
                }
              >
                {creatingWorkOrderId ===
                selectedServiceRequest.id
                  ? "Creating Work Order..."
                  : "Create Work Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


    /* =========================================================
       WORK ORDER MANAGEMENT + TECHNICIAN ASSIGNMENT
    ========================================================= */

    function renderWorkOrders() {
      if (
        auth.role !== "MANAGER" &&
        auth.role !== "DISPATCHER"
      ) {
        return (
          <RoleMessage
            title="Work Orders"
            message="Work order management is available only to managers and dispatchers."
          />
        );
      }

      if (workOrdersLoading) {
        return (
          <div className="page-body">
            <div className="loading-box">
              Loading work orders...
            </div>
          </div>
        );
      }

      if (workOrdersError) {
        return (
          <div className="page-body">
            <div className="error-box">
              {workOrdersError}
            </div>

            <button
              className="primary-button compact"
              onClick={loadWorkOrders}
            >
              Retry
            </button>
          </div>
        );
      }

      return (
        <div className="page-body">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                DISPATCH OPERATIONS
              </span>

              <h2>
                Work Orders
              </h2>

              <p>
                View work orders and assign technicians.
              </p>
            </div>

            <button
              className="small-button"
              onClick={() => {
                loadWorkOrders();
                loadTechnicians();
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {assignmentError && (
            <div className="error-box content-error">
              {assignmentError}
            </div>
          )}

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  Work Order Queue
                </h3>

                <span>
                  {workOrders.length} work orders
                </span>
              </div>
            </div>

            {workOrders.length === 0 ? (
              <EmptyState text="No work orders found." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>
                        Work Order
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Site
                      </th>

                      <th>
                        Title
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Assigned Technician
                      </th>

                      <th>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {workOrders.map(
                      (workOrder) => {
                        const currentTechnicianId =
                          workOrder.technicianId
                            ?.toString() || "";

                        const isAssigning =
                          assigningWorkOrderId ===
                          workOrder.id;

                        return (
                          <tr
                            key={
                              workOrder.id
                            }
                          >
                            <td>
                              <strong>
                                #
                                {
                                  workOrder.id
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                workOrder.customerName
                              }
                            </td>

                            <td>
                              {
                                workOrder.siteName
                              }
                            </td>

                            <td>
                              <strong>
                                {
                                  workOrder.title
                                }
                              </strong>
                            </td>

                            <td>
                              <StatusBadge
                                status={
                                  workOrder.status
                                }
                              />
                            </td>

                            <td>
                              {workOrder.technicianName ? (
                                <strong>
                                  {
                                    workOrder.technicianName
                                  }
                                </strong>
                              ) : (
                                <span>
                                  Not assigned
                                </span>
                              )}
                            </td>

                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  gap: "8px",
                                  minWidth:
                                    "280px"
                                }}
                              >
                                <select
                                  value={
                                    currentTechnicianId
                                  }
                                  disabled={
                                    isAssigning ||
                                    techniciansLoading
                                  }
                                  onChange={(event) => {
                                    const value =
                                      event.target.value;

                                    if (!value) {
                                      return;
                                    }

                                    assignTechnician(
                                      workOrder.id,
                                      Number(value)
                                    );
                                  }}
                                  style={{
                                    minWidth:
                                      "180px",
                                    padding:
                                      "8px 10px",
                                    border:
                                      "1px solid #d1d5db",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "white"
                                  }}
                                >
                                  <option value="">
                                    Select technician
                                  </option>

                                  {technicians
                                    .filter(
                                      (
                                        technician
                                      ) =>
                                        technician.active
                                    )
                                    .map(
                                      (
                                        technician
                                      ) => (
                                        <option
                                          key={
                                            technician.id
                                          }
                                          value={
                                            technician.id
                                          }
                                        >
                                          {
                                            technician.fullName
                                          }
                                        </option>
                                      )
                                    )}
                                </select>

                                {isAssigning && (
                                  <span
                                    style={{
                                      fontSize:
                                        "12px",
                                      opacity:
                                        0.7
                                    }}
                                  >
                                    Assigning...
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      );
    }
/* =========================================================
   TECHNICIANS
========================================================= */

function renderTechnicians() {
  if (
    auth.role !== "MANAGER" &&
    auth.role !== "DISPATCHER"
  ) {
    return (
      <RoleMessage
        title="Technicians"
        message="Technician management is available only to managers and dispatchers."
      />
    );
  }

  if (techniciansLoading) {
    return (
      <div className="page-body">
        <div className="loading-box">
          Loading technicians...
        </div>
      </div>
    );
  }

  if (techniciansError) {
    return (
      <div className="page-body">
        <div className="error-box">
          {techniciansError}
        </div>

        <button
          className="primary-button compact"
          onClick={loadTechnicians}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            FIELD OPERATIONS
          </span>

          <h2>
            Technicians
          </h2>

          <p>
            View available technicians in the KEYSTONE field team.
          </p>
        </div>

        <button
          className="small-button"
          onClick={loadTechnicians}
        >
          ↻ Refresh
        </button>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>
              Technician Directory
            </h3>

            <span>
              {technicians.length} technicians
            </span>
          </div>
        </div>

        {technicians.length === 0 ? (
          <EmptyState
            text="No technicians found."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Technician
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Availability
                  </th>
                </tr>
              </thead>

              <tbody>
                {technicians.map(
                  (technician) => (
                    <tr
                      key={technician.id}
                    >
                      <td>
                        <strong>
                          {technician.fullName}
                        </strong>
                      </td>

                      <td>
                        {technician.email}
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            technician.role
                          }
                        />
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            technician.active
                              ? "ACTIVE"
                              : "INACTIVE"
                          }
                        />
                      </td>

                      <td>
                        {technician.active
                          ? "Available"
                          : "Inactive"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
    /* =========================================================
       TECHNICIAN ASSIGNED WORK ORDERS
    ========================================================= */

    function renderAssigned() {
      if (auth.role !== "TECHNICIAN") {
        return (
          <RoleMessage
            title="Assigned Work Orders"
            message="Assigned work orders are available only to technicians."
          />
        );
      }

      if (assignedLoading) {
        return (
          <div className="page-body">
            <div className="loading-box">
              Loading assigned work orders...
            </div>
          </div>
        );
      }

      if (assignedError) {
        return (
          <div className="page-body">
            <div className="error-box">
              {assignedError}
            </div>

            <button
              className="primary-button compact"
              onClick={loadAssignedWorkOrders}
            >
              Retry
            </button>
          </div>
        );
      }

      return (
        <div className="page-body">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                FIELD OPERATIONS
              </span>

              <h2>
                Assigned Work Orders
              </h2>

              <p>
                View your assigned jobs and update their
                progress.
              </p>
            </div>

            <button
              className="small-button"
              onClick={loadAssignedWorkOrders}
            >
              ↻ Refresh
            </button>
          </div>

          {statusUpdateError && (
            <div className="error-box content-error">
              {statusUpdateError}
            </div>
          )}

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  My Assigned Jobs
                </h3>

                <span>
                  {assignedWorkOrders.length} assigned work orders
                </span>
              </div>
            </div>

            {assignedWorkOrders.length === 0 ? (
              <EmptyState
                text="No work orders are currently assigned to you."
              />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>
                        Work Order
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Site
                      </th>

                      <th>
                        Title
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Scheduled
                      </th>

                      <th>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignedWorkOrders.map(
                      (workOrder) => {
                        const isUpdating =
                          updatingStatusId ===
                          workOrder.id;

                        return (
                          <tr
                            key={
                              workOrder.id
                            }
                          >
                            <td>
                              <strong>
                                #
                                {
                                  workOrder.id
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                workOrder.customerName
                              }
                            </td>

                            <td>
                              {
                                workOrder.siteName
                              }
                            </td>

                            <td>
                              <strong>
                                {
                                  workOrder.title
                                }
                              </strong>
                            </td>

                            <td>
                              <StatusBadge
                                status={
                                  workOrder.status
                                }
                              />
                            </td>

                            <td>
                              {workOrder.scheduledAt ||
                                "Not scheduled"}
                            </td>

                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  gap: "8px",
                                  minWidth:
                                    "210px"
                                }}
                              >
                                {workOrder.status ===
                                  "ASSIGNED" && (
                                  <button
                                    className="primary-button compact"
                                    disabled={
                                      isUpdating
                                    }
                                    onClick={() =>
                                      updateWorkOrderStatus(
                                        workOrder.id,
                                        "IN_PROGRESS"
                                      )
                                    }
                                  >
                                    {isUpdating
                                      ? "Updating..."
                                      : "Start Job"}
                                  </button>
                                )}

                                {workOrder.status ===
                                  "IN_PROGRESS" && (
                                  <button
                                    className="primary-button compact"
                                    disabled={
                                      isUpdating
                                    }
                                    onClick={() =>
                                      updateWorkOrderStatus(
                                        workOrder.id,
                                        "COMPLETED"
                                      )
                                    }
                                  >
                                    {isUpdating
                                      ? "Updating..."
                                      : "Complete Job"}
                                  </button>
                                )}

                                {workOrder.status ===
                                  "COMPLETED" && (
                                  <span
                                    style={{
                                      fontSize:
                                        "13px",
                                      opacity:
                                        0.75
                                    }}
                                  >
                                    Job completed
                                  </span>
                                )}

                                {workOrder.status ===
                                  "NEW" && (
                                  <span
                                    style={{
                                      fontSize:
                                        "13px",
                                      opacity:
                                        0.75
                                    }}
                                  >
                                    Waiting for assignment
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      );
    }


  /* =========================================================
     PROFILE
  ========================================================= */

  function renderProfile() {
    return (
      <div className="page-body">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              ACCOUNT
            </span>

            <h2>
              Profile
            </h2>

            <p>
              Manage your KEYSTONE profile information.
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="detail-grid">
            <Detail
              label="Full Name"
              value={
                auth.fullName
              }
            />

            <Detail
              label="Role"
              value={
                auth.role
              }
            />

            <Detail
              label="Account"
              value="Authenticated"
            />

            <Detail
              label="Access"
              value="Protected workspace"
            />
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================
     OPERATIONS
  ========================================================= */

  function renderOperations() {
    return (
      <div className="page-body">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              FIELD SERVICE
            </span>

            <h2>
              Operations
            </h2>

            <p>
              Monitor field service operations.
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Operations Monitor
              </h3>

              <span>
                KEYSTONE operational workspace
              </span>
            </div>
          </div>

          <div className="empty-state">
            <div>
              ◆
            </div>

            <p>
              Operations workspace opened successfully.
            </p>
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================
     PAGE ROUTER
  ========================================================= */

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return renderDashboard();

      case "profile":
        return renderProfile();

      case "users":
        return renderUsers();

      case "operations":
        return renderOperations();

      case "work-orders":
        return renderWorkOrders();

      case "service-requests":
        return renderServiceRequests();

      case "technicians":
        return renderTechnicians();

      case "assigned":
        return renderAssigned();

      default:
        return renderHome();
    }
  }

  /* =========================================================
     ROLE DASHBOARD UI
  ========================================================= */

  return (
    <main className="role-dashboard">
      <header className="role-header">
        <div className="brand">
          KEYSTONE
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <span
            style={{
              fontSize: "13px",
              opacity: 0.75
            }}
          >
            {auth.role}
          </span>

          <button
            className="logout-button dark"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </header>

      <section className="role-content">

        {activePage !== "home" && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px"
            }}
          >
            <button
              className="small-button"
              onClick={() =>
                setActivePage("home")
              }
            >
              ← Workspace
            </button>

            <button
              className="small-button"
              onClick={() =>
                setActivePage("home")
              }
            >
              Home
            </button>
          </div>
        )}

        {renderPage()}
      </section>
    </main>
  );
}

/* =========================================================
   ROLE MESSAGE
========================================================= */

function RoleMessage({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="page-body">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            KEYSTONE
          </span>

          <h2>
            {title}
          </h2>

          <p>
            {message}
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="empty-state">
          <div>
            ✓
          </div>

          <p>
            {title} page opened successfully.
          </p>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function Detail({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function StatusBadge({
  status
}: {
  status: string;
}) {
  const className = status
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");

  return (
    <span
      className={`status ${className}`}
    >
      {status.replaceAll(
        "_",
        " "
      )}
    </span>
  );
}

function PriorityBadge({
  priority
}: {
  priority: string;
}) {
  return (
    <span
      className={`priority ${priority.toLowerCase()}`}
    >
      {priority}
    </span>
  );
}

function EmptyState({
  text
}: {
  text: string;
}) {
  return (
    <div className="empty-state">
      <div>
        ◌
      </div>

      <p>
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   REACT START
========================================================= */

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "KEYSTONE root element was not found."
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
