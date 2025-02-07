import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Grid, Box, Autocomplete } from "@mui/material";
import axios from "../services/axios";

const ManageClients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientData, setClientData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // 🔹 Search clients as user types
  useEffect(() => {
    if (searchQuery.length >= 2) {
      axios
        .get(`/clients/?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => setSearchResults(res.data))
        .catch((err) => console.error("Error searching clients:", err));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // 🔹 When user selects a client, load their info into the form
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
    });
  };

  // 🔹 Handle updating the client's data
  const handleUpdateClient = async () => {
    if (!selectedClient) {
      alert("No client selected.");
      return;
    }

    try {
      await axios.patch(`/clients/${selectedClient.id}/`, clientData);
      alert("Client information updated successfully!");
    } catch (err) {
      console.error("Error updating client:", err);
      alert(err.response?.data?.error || "Failed to update client.");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Clients
      </Typography>

      {/* 🔹 Search Clients */}
      <Autocomplete
        options={searchResults}
        getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
        onChange={(event, newValue) => handleSelectClient(newValue)}
        onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
        renderInput={(params) => <TextField {...params} label="Search for a Client" variant="outlined" fullWidth />}
      />

      {/* 🔹 If a client is selected, show form */}
      {selectedClient && (
        <Box mt={3}>
          <Typography variant="h6">Edit Client Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                value={clientData.first_name}
                onChange={(e) => setClientData({ ...clientData, first_name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                value={clientData.last_name}
                onChange={(e) => setClientData({ ...clientData, last_name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone"
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleUpdateClient}>
                Update Client
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ManageClients;
