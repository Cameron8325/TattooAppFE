// components/AppointmentModal.js  
import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "../../services/axios";
import { getTodayDate } from "../../utils/dateTime";
import { getCSRFToken } from "../../services/authService";

const AppointmentModal = ({
  open,
  onClose,
  initialData,
  onSave,
  user,
}) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    employee: "",
    service: "",
    price: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientData, setNewClientData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // Load dropdowns & initialize form
  useEffect(() => {
    if (!open) return;
    const fetchDropdowns = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          axios.get("/users/?role=employee"),
          axios.get("/services/"),
        ]);
        setArtists(aRes.data);
        setServices(sRes.data);
      } catch (e) {
        console.error("Dropdown fetch error:", e);
      }
    };
    fetchDropdowns();

    if (isEdit) {
      const appt = initialData;
      setFormData({
        employee: appt.employee,
        service: appt.service,
        price: appt.price,
        date: appt.date,
        startTime: appt.time?.slice(0, 5),
        endTime: appt.end_time?.slice(0, 5),
        notes: appt.notes || "",
      });
      setSelectedClient(appt.client);
      setIsNewClient(false);
    } else {
      const today = getTodayDate();
      setFormData({
        employee: user.role === "admin" ? "" : user.id,
        service: "",
        price: "",
        date: today,
        startTime: "12:00",
        endTime: "13:00",
        notes: "",
      });
      setSelectedClient(null);
      setIsNewClient(false);
      setNewClientData({ first_name: "", last_name: "", email: "", phone: "" });
    }
  }, [open, initialData, isEdit, user.role, user.id]);

  // Client search
  useEffect(() => {
    if (searchQuery.length < 2) return setSearchResults([]);
    axios.get(`/clients/?search=${encodeURIComponent(searchQuery)}`)
      .then(r => setSearchResults(r.data))
      .catch(() => setSearchResults([]));
  }, [searchQuery]);

  const handleChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  // Save or update
  const handleSave = async () => {
    const isAdmin = user.role === "admin";
    const payload = {
      employee: formData.employee,
      service: formData.service,
      price: formData.price,
      date: formData.date,
      time: formData.startTime + ":00",
      end_time: formData.endTime + ":00",
      notes: formData.notes,
      status: isAdmin ? "confirmed" : "pending",
      requires_approval: !isAdmin,
    };

    if (isNewClient) {
      if (!newClientData.first_name || !newClientData.last_name || !newClientData.email) {
        return alert("New client info is incomplete");
      }
      payload.new_client = { ...newClientData, employee: formData.employee };
    } else {
      const cid = selectedClient?.id || initialData?.client?.id;
      if (!cid) return alert("Select or create a client first");
      payload.client_id = cid;
    }

    try {
      if (isEdit) {
        await axios.patch(
          `/appointments/${initialData.id}/reschedule/`,
          payload,
          { headers: { "X-CSRFToken": await getCSRFToken() } }
        );
      } else {
        await axios.post(
          "/appointments/",
          payload,
          { headers: { "X-CSRFToken": await getCSRFToken() } }
        );
      }
      onSave();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save appointment");
    }
  };

  // Mark Completed
  const handleMarkCompleted = async () => {
    try {
      await axios.patch(
        `/appointments/${initialData.id}/reschedule/`,
        { status: "completed" },
        { headers: { "X-CSRFToken": await getCSRFToken() } }
      );
      onSave();
    } catch (e) {
      console.error(e);
      alert("Error marking completed");
    }
  };

  // Mark No-Show
  const handleMarkNoShow = async () => {
    try {
      await axios.patch(
        `/appointments/${initialData.id}/reschedule/`,
        { status: "no_show" },
        { headers: { "X-CSRFToken": await getCSRFToken() } }
      );
      onSave();
    } catch (e) {
      console.error(e);
      alert("Error marking no-show");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Appointment" : "Create Appointment"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Client selector / new-client toggle */}
          {!isNewClient && (
            <Grid item xs={12}>
              <Autocomplete
                value={selectedClient}
                onChange={(e, val) => setSelectedClient(val)}
                onInputChange={(e, val) => setSearchQuery(val)}
                options={searchResults}
                getOptionLabel={o => `${o.first_name} ${o.last_name} (${o.email})`}
                renderInput={params => <TextField {...params} label="Search or Select Client" />}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsNewClient(!isNewClient);
                if (!isNewClient) setSelectedClient(null);
              }}
            >
              {isNewClient ? "Use Existing Client" : "Create New Client"}
            </Button>
          </Grid>
          {isNewClient && (
            <>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={newClientData.first_name}
                  onChange={e =>
                    setNewClientData(d => ({ ...d, first_name: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={newClientData.last_name}
                  onChange={e =>
                    setNewClientData(d => ({ ...d, last_name: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  fullWidth
                  value={newClientData.email}
                  onChange={e =>
                    setNewClientData(d => ({ ...d, email: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={newClientData.phone}
                  onChange={e =>
                    setNewClientData(d => ({ ...d, phone: e.target.value }))
                  }
                />
              </Grid>
            </>
          )}

          {/* Employee, Service, Price, Date/Time, Notes */}
          <Grid item xs={12}>
            <FormControl fullWidth disabled={user.role === "employee"}>
              <InputLabel>Employee</InputLabel>
              <Select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
              >
                {artists.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Service</InputLabel>
              <Select
                name="service"
                value={formData.service}
                onChange={handleChange}
              >
                {services.map(s => (
                  <MenuItem key={s.id} value={s.name}>
                    {s.name_display}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="date"
              label="Date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="startTime"
              label="Start Time"
              type="time"
              fullWidth
              value={formData.startTime}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="endTime"
              label="End Time"
              type="time"
              fullWidth
              value={formData.endTime}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes"
              multiline
              rows={2}
              fullWidth
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {isEdit ? "Save Changes" : "Create"}
        </Button>
        {isEdit && (
          <>
            <Button onClick={handleMarkCompleted} color="success">
              Completed
            </Button>
            <Button onClick={handleMarkNoShow} color="error">
              No Show
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentModal;
