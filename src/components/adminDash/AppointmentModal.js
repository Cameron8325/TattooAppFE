// components/AppointmentModal.js  
import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem,
  IconButton, Alert, Checkbox, FormControlLabel, Divider, Typography, Stack
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "../../services/axios";
import { getErrorMessage } from "../../services/axios";
import { getTodayDate, isValidTimeRange } from "../../utils/dateTime";

const AppointmentModal = ({
  open,
  onClose,
  initialData,
  onSave,
  user,
  draftSlot,
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
    depositRequired: false,
    depositPaid: false,
    depositAmount: "",
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
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load dropdowns & initialize form
  useEffect(() => {
    if (!open) return;
    setError("");
    if (user.role === "employee") setArtists([user]);
    const fetchDropdowns = async () => {
      try {
        const requests = user.role === "admin"
          ? [axios.get("/users/?role=employee"), axios.get("/services/")]
          : [Promise.resolve({ data: [user] }), axios.get("/services/")];
        const [aRes, sRes] = await Promise.all(requests);
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
        depositRequired: Boolean(appt.deposit_required),
        depositPaid: Boolean(appt.deposit_paid),
        depositAmount: appt.deposit_amount || "",
      });
      setSelectedClient(appt.client);
      setIsNewClient(false);
    } else {
      const today = draftSlot?.date || getTodayDate();
      setFormData({
        employee: user.role === "admin" ? "" : user.id,
        service: "",
        price: "",
        date: today,
        startTime: draftSlot?.startTime || "12:00",
        endTime: draftSlot?.endTime || "13:00",
        notes: "",
        depositRequired: false,
        depositPaid: false,
        depositAmount: "",
      });
      setSelectedClient(null);
      setIsNewClient(false);
      setNewClientData({ first_name: "", last_name: "", email: "", phone: "" });
    }
  }, [open, initialData, isEdit, user, draftSlot]);

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
    setError("");

    if (!formData.employee) return setError("Select an employee.");
    if (!formData.service) return setError("Select a service.");
    if (formData.price === "" || !Number.isFinite(Number(formData.price)) || Number(formData.price) < 0) {
      return setError("Enter a price of zero or more.");
    }
    if (!formData.date || !formData.startTime || !formData.endTime) {
      return setError("Add the appointment date, start time, and end time.");
    }
    if (!isValidTimeRange(formData.startTime, formData.endTime)) {
      return setError("End time must be after start time.");
    }
    if (
      formData.depositRequired &&
      formData.depositAmount !== "" &&
      (!Number.isFinite(Number(formData.depositAmount)) || Number(formData.depositAmount) < 0)
    ) {
      return setError("Enter a deposit amount of zero or more.");
    }
    if (
      formData.depositRequired &&
      formData.depositAmount !== "" &&
      Number(formData.depositAmount) > Number(formData.price)
    ) {
      return setError("Deposit amount cannot exceed the appointment price.");
    }

    const isAdmin = user.role === "admin";
    const payload = {
      employee: formData.employee,
      service: formData.service,
      price: formData.price,
      date: formData.date,
      time: formData.startTime + ":00",
      end_time: formData.endTime + ":00",
      notes: formData.notes,
      ...(!isEdit ? { status: isAdmin ? "confirmed" : "pending", requires_approval: !isAdmin } : {}),
      deposit_required: formData.depositRequired,
      deposit_paid: formData.depositRequired && formData.depositPaid,
      deposit_amount: formData.depositRequired && formData.depositAmount ? formData.depositAmount : null,
    };

    if (isNewClient) {
      if (!newClientData.first_name || !newClientData.last_name || !newClientData.email) {
        return setError("Add the new client's first name, last name, and email.");
      }
      if (!/^\S+@\S+\.\S+$/.test(newClientData.email)) {
        return setError("Enter a valid client email address.");
      }
      payload.new_client = { ...newClientData, employee: formData.employee };
    } else {
      const cid = selectedClient?.id || initialData?.client?.id;
      if (!cid) return setError("Select or create a client first.");
      payload.client_id = cid;
    }

    try {
      setSaving(true);
      if (isEdit) {
        await axios.patch(
          `/appointments/${initialData.id}/reschedule/`,
          payload
        );
      } else {
        await axios.post(
          "/appointments/",
          payload
        );
      }
      onSave();
    } catch (err) {
      console.error("Save failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const recordOutcome = async (status) => {
    setError("");
    setSaving(true);
    try {
      await axios.patch(`/appointments/${initialData.id}/reschedule/`, { status });
      onSave();
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      setSaving(false);
    }
  };
  const handleMarkCompleted = () => recordOutcome('completed');
  const handleMarkNoShow = () => recordOutcome('no_show');

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {isEdit ? "Edit appointment" : "New appointment"}
        <IconButton
          aria-label="close"
          disabled={saving}
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        <Typography variant="overline" sx={{ color: "text.secondary" }}>Client</Typography>
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
                renderInput={params => <TextField {...params} label="Search clients" placeholder="Name or email" />}
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
              {isNewClient ? "Use existing client" : "Add a new client"}
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
                type="email"
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
          <Grid item xs={12}><Divider sx={{ my: 0.5 }} /><Typography variant="overline" sx={{ color: "text.secondary" }}>Booking details</Typography></Grid>
          <Grid item xs={12}>
            <FormControl fullWidth disabled={user.role === "employee"}>
              <InputLabel id="appointment-employee-label">Employee</InputLabel>
              <Select
                labelId="appointment-employee-label"
                label="Employee"
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="appointment-service-label">Service</InputLabel>
              <Select
                labelId="appointment-service-label"
                label="Service"
                name="service"
                value={formData.service}
                onChange={(event) => {
                  handleChange(event);
                  const selected = services.find((service) => service.name === event.target.value);
                  if (selected && !isEdit) setFormData((current) => ({ ...current, service: event.target.value, price: selected.price }));
                }}
              >
                {services.map(s => (
                  <MenuItem key={s.id} value={s.name}>
                    {s.name_display}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="date"
              label="Date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              name="startTime"
              label="Start Time"
              type="time"
              fullWidth
              value={formData.startTime}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
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
          <Grid item xs={12}><Divider sx={{ my: 0.5 }} /><Typography variant="overline" sx={{ color: "text.secondary" }}>Deposit</Typography></Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 3 }} alignItems={{ sm: "center" }}>
              <FormControlLabel
                control={<Checkbox checked={formData.depositRequired} onChange={(event) => setFormData((current) => ({ ...current, depositRequired: event.target.checked, depositPaid: event.target.checked ? current.depositPaid : false }))} />}
                label="Deposit required"
              />
              <FormControlLabel
                control={<Checkbox checked={formData.depositPaid} disabled={!formData.depositRequired} onChange={(event) => setFormData((current) => ({ ...current, depositPaid: event.target.checked }))} />}
                label="Deposit paid"
              />
              <TextField
                label="Deposit amount"
                type="number"
                value={formData.depositAmount}
                disabled={!formData.depositRequired}
                onChange={(event) => setFormData((current) => ({ ...current, depositAmount: event.target.value }))}
                inputProps={{ min: 0, step: "0.01" }}
                sx={{ width: { xs: "100%", sm: 180 } }}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create appointment"}
        </Button>
        {isEdit && (
          <>
            <Button onClick={handleMarkCompleted} color="success" disabled={saving || initialData.status === 'completed' || (user.role !== 'admin' && initialData.requires_approval)}>
              Mark completed
            </Button>
            <Button onClick={handleMarkNoShow} color="error" disabled={saving || initialData.status === 'no_show' || (user.role !== 'admin' && initialData.requires_approval)}>
              Mark no-show
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentModal;
