// frontend/src/components/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { me } from "../api/auth";

export default function PrivateRoute({ children, roles }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("access");
    if (!token) {
      setOk(false);
      return;
    }

    const localRole = localStorage.getItem("role");
    if (roles && roles.length > 0) {
      if (localRole) {
        setOk(roles.includes(localRole));
        return;
      }
    } else {
      // no role restriction, any logged-in user
      if (localRole) {
        setOk(true);
        return;
      }
    }

    // If we reach here, role info missing locally -> fetch /me/
    me()
      .then((res) => {
        if (cancelled) return;
        const r = res.data.role;
        const isSeller = !!res.data.is_seller;
        if (r) localStorage.setItem("role", r);
        localStorage.setItem("is_seller", String(isSeller));
        if (roles && roles.length > 0) {
          setOk(roles.includes(r));
        } else {
          setOk(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setOk(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roles]);

  if (ok === null) return <div>loading...</div>;
  return ok ? children : <Navigate to="/login" replace />;
}
