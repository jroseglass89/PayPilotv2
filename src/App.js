import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Settings, Bell, TrendingUp, CreditCard, Plus, X } from 'lucide-react';

const PaycheckPilotApp = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Restaurants' });
  const [transactions, setTransactions] = useState([]);
  const [weeklyAllowance, setWeeklyAllowance] = useState(200);
  const [nextPaycheck, setNextPaycheck] = useState({ amount: 0, date: '' });

  const categories = ['Restaurants', 'Entertainment', 'Coffee/Drinks', 'Shopping', 'Transportation', 'Other'];
  const categoryColors = {
    'Restaurants': 'bg-orange-500',
    'Entertainment': 'bg-purple-500', 
    'Coffee/Drinks': 'bg-amber-500',
    'Shopping': 'bg-pink-500',
    'Transportation': 'bg-blue-500',
    'Other': 'bg-gray-500'
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('paypilot-transactions');
    const savedAllowance = localStorage.getItem('paypilot-allowance');
    const savedPaycheck = localStorage.getItem('paypilot-paycheck');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedAllowance) {
      setWeeklyAllowance(parseFloat(savedAllowance));
    }
    if (savedPaycheck) {
      setNextPaycheck(JSON.parse(savedPaycheck));
    }
  }, []);

  // Save data to localStorage whenever transactions or allowance changes
  useEffect(() => {
    localStorage.setItem('paypilot-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('paypilot-allowance', weeklyAllowance.toString());
  }, [weeklyAllowance]);

  useEffect(() => {
    localStorage.setItem('paypilot-paycheck', JSON.stringify(nextPaycheck));
  }, [nextPaycheck]);

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense = {
        id: Date.now(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: new Date().toLocaleDateString()
      };
      setTransactions([expense, ...transactions]);
      setNewExpense({ description: '', amount: '', category: 'Restaurants' });
      setShowAddExpense(false);
    }
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculate spending dynamically
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remainingAmount = weeklyAllowance - totalSpent;

  // Calculate category spending
  const categorySpending = categories.map(category => {
    const categoryTransactions = transactions.filter(t => t.category === category);
    const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    return {
      category,
      amount: parseFloat(amount.toFixed(2)),
      transactions: categoryTransactions.length,
      color: categoryColors[category]
    };
  }).filter(cat => cat.amount > 0).sort((a, b) => b.amount - a.amount);

  const DashboardTab = () => (
    <div className="space-y-4">
      {/* Weekly Allowance Status */}
      <div className="bg-green-500 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold mb-1">This Week</h3>
            <div className="text-2xl font-bold">${remainingAmount.toFixed(2)}</div>
            <p className="text-green-100 text-sm">Remaining of ${weeklyAllowance}</p>
          </div>
          <DollarSign size={32} className="opacity-80" />
        </div>
        
        {/* Progress Bar */}
        <div className="bg-green-600 rounded-full h-2 mt-3">
          <div 
            className="bg-green-300 h-2 rounded-full" 
            style={{ width: `${Math.max(0, (remainingAmount / weeklyAllowance) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Next Paycheck */}
      {nextPaycheck.amount > 0 && nextPaycheck.date && (
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Next Paycheck</h3>
              <div className="text-xl font-bold">${nextPaycheck.amount.toLocaleString()}</div>
              <p className="text-gray-600 text-sm">{nextPaycheck.date}</p>
            </div>
            <Calendar className="text-blue-500" size={28} />
          </div>
        </div>
      )}

      {/* Spending Overview */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold mb-3">Spending Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold">${totalSpent.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Spent</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(remainingAmount).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {remainingAmount >= 0 ? 'Left' : 'Over'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {categorySpending.length > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold mb-3">Top Spending</h3>
          {categorySpending.slice(0, 3).map((category, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <span className="text-sm">{category.category}</span>
              </div>
              <span className="font-medium">${category.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SpendingTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Your Spending</h2>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-blue-500 text-white p-2 rounded-full"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Expense</h3>
              <button onClick={() => setShowAddExpense(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="What did you buy?"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full border rounded pl-8 pr-3 py-2"
                />
              </div>
              
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={addExpense}
                  className="flex-1 py-2 bg-blue-500 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-lg border">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
            <p>No expenses yet</p>
            <p className="text-sm">Tap + to add your first purchase</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
              <div>
                <div className="font-medium">{transaction.description}</div>
                <div className="text-sm text-gray-500">{transaction.category}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  className="text-red-500 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Settings</h2>
      
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold mb-3">Paycheck Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Next Paycheck Amount</label>
            <div className="flex items-center space-x-2">
              <span>$</span>
              <input 
                type="number" 
                value={nextPaycheck.amount || ''}
                onChange={(e) => setNextPaycheck({...nextPaycheck, amount: parseFloat(e.target.value) || 0})}
                className="border rounded px-3 py-2 flex-1"
                placeholder="3200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Expected Date</label>
            <input 
              type="date" 
              value={nextPaycheck.date}
              onChange={(e) => setNextPaycheck({...nextPaycheck, date: e.target.value})}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold mb-3">Allowance Settings</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Weekly Allowance</label>
          <div className="flex items-center space-x-2">
            <span>$</span>
            <input 
              type="number" 
              value={weeklyAllowance}
              onChange={(e) => setWeeklyAllowance(parseFloat(e.target.value) || 0)}
              className="border rounded px-3 py-2 w-24"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold mb-3">Data</h3>
        <button 
          onClick={() => {
            if (confirm('Clear all data? This cannot be undone.')) {
              setTransactions([]);
              localStorage.removeItem('paypilot-transactions');
            }
          }}
          className="bg-red-500 text-white px-4 py-2 rounded text-sm"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">PayPilot</h1>
          <Bell size={20} className="text-gray-500" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-20">
        {currentTab === 'dashboard' && <DashboardTab />}
        {currentTab === 'spending' && <SpendingTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t">
        <div className="flex">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex-1 py-3 flex flex-col items-center ${
              currentTab === 'dashboard' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <DollarSign size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setCurrentTab('spending')}
            className={`flex-1 py-3 flex flex-col items-center ${
              currentTab === 'spending' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <TrendingUp size={20} />
            <span className="text-xs mt-1">Spending</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex-1 py-3 flex flex-col items-center ${
              currentTab === 'settings' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaycheckPilotApp;