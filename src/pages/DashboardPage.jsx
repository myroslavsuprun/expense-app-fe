import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatCurrency, formatDate } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, PencilIcon, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TransactionForm from '../components/transactions/TransactionForm';
import Navbar from '../components/layout/Navbar';

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Summary calculation
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch categories
        const categoriesResponse = await api.getCategories({ limit: 100_000 });
        setCategories(categoriesResponse.data.categories);

        // Fetch transactions
        const params = {};
        if (selectedCategoryFilter) {
          params.categoryId = selectedCategoryFilter;
        }

        const transactionsResponse = await api.getTransactions(params);
        setTransactions(transactionsResponse.data.transactions);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategoryFilter]);

  const handleCreateTransaction = async (transactionData) => {
    try {
      const response = await api.createTransaction(transactionData);
      setTransactions((prev) => [response.data.transaction, ...prev]);
      setIsTransactionDialogOpen(false);
      console.log(response)
      toast.success(response.message || 'Transaction created successfully');
    } catch (err) {
      console.error('Error creating transaction:', err);
      toast.error(err.message || 'Failed to create transaction');
    }
  };

  const handleUpdateTransaction = async (id, transactionData) => {
    try {
      const response = await api.updateTransaction(id, transactionData);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? response.data.transaction : t))
      );
      setIsTransactionDialogOpen(false);
      setEditingTransaction(null);
      toast.success(response.message || 'Transaction updated successfully');
    } catch (err) {
      console.error('Error updating transaction:', err);
      toast.error("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      toast.success(response.message || 'Transaction deleted successfully');

    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error(err.message || 'Failed to delete transaction');
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'income') return transaction.type === 'INCOME';
    if (activeTab === 'expense') return transaction.type === 'EXPENSE';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Financial Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b">
            <h2 className="text-lg font-medium">Transactions</h2>

            <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-56">
                <Select
                  value={selectedCategoryFilter}
                  onValueChange={setSelectedCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem>All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTransaction
                        ? 'Update the transaction details below.'
                        : 'Fill in the transaction details below.'}
                    </DialogDescription>
                  </DialogHeader>

                  <TransactionForm
                    categories={categories}
                    onSubmit={editingTransaction
                      ? (data) => handleUpdateTransaction(editingTransaction.id, data)
                      : handleCreateTransaction
                    }
                    initialData={editingTransaction}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 pt-2">
              <TabsList className="grid w-full sm:w-80 grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <TransactionsList
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="income" className="m-0">
              <TransactionsList
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="expense" className="m-0">
              <TransactionsList
                transactions={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Transactions list component
function TransactionsList({ transactions, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-full p-2 mr-3 ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
              }`}>
              {transaction.type === 'INCOME' ? (
                <ArrowUpCircle className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium">{transaction.description}</h3>
              <div className="flex space-x-2 text-xs text-gray-500">
                <span>{formatDate(transaction.date)}</span>
                {transaction.category && (
                  <>
                    <span>•</span>
                    <Badge variant="outline">{transaction.category.name}</Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <span className={`mr-4 font-medium ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
              }`}>
              {transaction.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </span>

            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(transaction)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(transaction.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardPage;
