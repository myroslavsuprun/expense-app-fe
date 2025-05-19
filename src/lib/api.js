export const API_URL = "https://expense-tracker.checkpoint.lat";
// export const API_URL = "http://0.0.0.0:3001";

export const api = {
  // Base fetch function with auth
  async fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized errors globally
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      throw new Error("Session expired. Please log in again.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  },

  // Transactions
  async getTransactions(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.categoryId) queryParams.append("categoryId", params.categoryId);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";
    return this.fetchWithAuth(`/api/transactions/${queryString}`);
  },

  async createTransaction(transactionData) {
    return this.fetchWithAuth("/api/transactions/", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  },

  async updateTransaction(id, transactionData) {
    return this.fetchWithAuth(`/api/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(transactionData),
    });
  },

  async deleteTransaction(id) {
    return this.fetchWithAuth(`/api/transactions/${id}`, {
      method: "DELETE",
    });
  },

  // Categories
  async getCategories(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";
    return this.fetchWithAuth(`/api/categories/${queryString}`);
  },

  async createCategory(name) {
    return this.fetchWithAuth("/api/categories/", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async deleteCategory(id) {
    return this.fetchWithAuth(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// Helper functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100); // Convert cents to dollars
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
