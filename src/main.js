import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calculator, TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';

const FinancialModelingSuite = () => {
  const [activeTab, setActiveTab] = useState('wacc');
  
  // WACC State
  const [waccInputs, setWaccInputs] = useState({
    marketValueEquity: 500000000, // $500M
    marketValueDebt: 200000000,   // $200M
    costOfEquity: 12.5,           // 12.5%
    costOfDebt: 6.0,              // 6.0%
    taxRate: 25.0,                // 25%
    riskFreeRate: 4.5,            // 4.5%
    beta: 1.2,                    // Beta coefficient
    marketRiskPremium: 8.0        // 8.0%
  });

  // Dilution State
  const [dilutionInputs, setDilutionInputs] = useState({
    currentShares: 10000000,      // 10M shares
    currentValuation: 500000000,  // $500M
    fundraiseAmount: 50000000,    // $50M
    preMoneyValuation: 450000000, // $450M
    liquidationPreference: 1.0,   // 1x
    participationRights: false,
    proRataRights: true
  });

  // Debt Stack State
  const [debtStackInputs, setDebtStackInputs] = useState({
    revolvingCredit: { amount: 50000000, rate: 5.5, maturity: 3 },
    termLoanA: { amount: 100000000, rate: 6.5, maturity: 5 },
    termLoanB: { amount: 75000000, rate: 8.0, maturity: 7 },
    seniorNotes: { amount: 150000000, rate: 7.5, maturity: 10 },
    subordinatedDebt: { amount: 50000000, rate: 12.0, maturity: 8 },
    ebitda: 80000000, // $80M EBITDA
    cashFlow: 60000000 // $60M Free Cash Flow
  });

  // WACC Calculations
  const calculateWACC = () => {
    const totalValue = waccInputs.marketValueEquity + waccInputs.marketValueDebt;
    const equityWeight = waccInputs.marketValueEquity / totalValue;
    const debtWeight = waccInputs.marketValueDebt / totalValue;
    
    // CAPM Cost of Equity
    const capmCostOfEquity = waccInputs.riskFreeRate + (waccInputs.beta * waccInputs.marketRiskPremium);
    
    const afterTaxCostOfDebt = waccInputs.costOfDebt * (1 - waccInputs.taxRate / 100);
    const wacc = (equityWeight * waccInputs.costOfEquity) + (debtWeight * afterTaxCostOfDebt);
    
    return {
      wacc: wacc.toFixed(2),
      equityWeight: (equityWeight * 100).toFixed(1),
      debtWeight: (debtWeight * 100).toFixed(1),
      capmCostOfEquity: capmCostOfEquity.toFixed(2),
      afterTaxCostOfDebt: afterTaxCostOfDebt.toFixed(2),
      totalValue: totalValue
    };
  };

  // Dilution Calculations
  const calculateDilution = () => {
    const postMoneyValuation = dilutionInputs.preMoneyValuation + dilutionInputs.fundraiseAmount;
    const pricePerShare = dilutionInputs.preMoneyValuation / dilutionInputs.currentShares;
    const newShares = dilutionInputs.fundraiseAmount / pricePerShare;
    const totalSharesPost = dilutionInputs.currentShares + newShares;
    
    const ownershipPre = 100;
    const ownershipPost = (dilutionInputs.currentShares / totalSharesPost) * 100;
    const dilutionPercent = ownershipPre - ownershipPost;
    
    const valuePerSharePre = dilutionInputs.currentValuation / dilutionInputs.currentShares;
    const valuePerSharePost = postMoneyValuation / totalSharesPost;
    
    return {
      postMoneyValuation,
      pricePerShare: pricePerShare.toFixed(2),
      newShares: Math.round(newShares),
      totalSharesPost: Math.round(totalSharesPost),
      ownershipPost: ownershipPost.toFixed(1),
      dilutionPercent: dilutionPercent.toFixed(1),
      valuePerSharePre: valuePerSharePre.toFixed(2),
      valuePerSharePost: valuePerSharePost.toFixed(2)
    };
  };

  // Debt Stack Calculations
  const calculateDebtMetrics = () => {
    const debtLevels = [
      { name: 'Revolving Credit', ...debtStackInputs.revolvingCredit, type: 'Senior Secured' },
      { name: 'Term Loan A', ...debtStackInputs.termLoanA, type: 'Senior Secured' },
      { name: 'Term Loan B', ...debtStackInputs.termLoanB, type: 'Senior Secured' },
      { name: 'Senior Notes', ...debtStackInputs.seniorNotes, type: 'Senior Unsecured' },
      { name: 'Subordinated Debt', ...debtStackInputs.subordinatedDebt, type: 'Subordinated' }
    ];
    
    const totalDebt = debtLevels.reduce((sum, debt) => sum + debt.amount, 0);
    const weightedAverageCost = debtLevels.reduce((sum, debt) => sum + (debt.amount * debt.rate), 0) / totalDebt;
    const totalLeverageRatio = totalDebt / debtStackInputs.ebitda;
    const interestCoverage = debtStackInputs.ebitda / (totalDebt * weightedAverageCost / 100);
    
    return {
      debtLevels: debtLevels.map(debt => ({
        ...debt,
        weight: ((debt.amount / totalDebt) * 100).toFixed(1),
        annualInterest: (debt.amount * debt.rate / 100)
      })),
      totalDebt,
      weightedAverageCost: weightedAverageCost.toFixed(2),
      totalLeverageRatio: totalLeverageRatio.toFixed(2),
      interestCoverage: interestCoverage.toFixed(2)
    };
  };

  const waccResults = calculateWACC();
  const dilutionResults = calculateDilution();
  const debtResults = calculateDebtMetrics();

  // Sensitivity Analysis Data
  const generateSensitivityData = () => {
    const baseWACC = parseFloat(waccResults.wacc);
    return [
      { scenario: 'Base Case', wacc: baseWACC, npv: 100 },
      { scenario: '-2% Cost of Equity', wacc: baseWACC - 1.2, npv: 115 },
      { scenario: '-1% Cost of Equity', wacc: baseWACC - 0.6, npv: 107 },
      { scenario: '+1% Cost of Equity', wacc: baseWACC + 0.6, npv: 94 },
      { scenario: '+2% Cost of Equity', wacc: baseWACC + 1.2, npv: 87 }
    ];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <Calculator className="mr-3 text-blue-600" />
        Advanced Financial Modeling Suite
      </h1>

      {/* Tab Navigation */}
      <div className="flex mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('wacc')}
          className={`px-6 py-3 font-medium ${activeTab === 'wacc' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <TrendingUp className="inline mr-2 w-4 h-4" />
          WACC Analysis
        </button>
        <button
          onClick={() => setActiveTab('dilution')}
          className={`px-6 py-3 font-medium ${activeTab === 'dilution' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Target className="inline mr-2 w-4 h-4" />
          Dilution Model
        </button>
        <button
          onClick={() => setActiveTab('debt')}
          className={`px-6 py-3 font-medium ${activeTab === 'debt' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart3 className="inline mr-2 w-4 h-4" />
          Debt Stack
        </button>
      </div>

      {/* WACC Analysis Tab */}
      {activeTab === 'wacc' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WACC Inputs */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">WACC Model Inputs</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Value of Equity ($)</label>
                <input
                  type="number"
                  value={waccInputs.marketValueEquity}
                  onChange={(e) => setWaccInputs({...waccInputs, marketValueEquity: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Value of Debt ($)</label>
                <input
                  type="number"
                  value={waccInputs.marketValueDebt}
                  onChange={(e) => setWaccInputs({...waccInputs, marketValueDebt: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost of Equity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={waccInputs.costOfEquity}
                  onChange={(e) => setWaccInputs({...waccInputs, costOfEquity: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost of Debt (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={waccInputs.costOfDebt}
                  onChange={(e) => setWaccInputs({...waccInputs, costOfDebt: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={waccInputs.taxRate}
                  onChange={(e) => setWaccInputs({...waccInputs, taxRate: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beta</label>
                <input
                  type="number"
                  step="0.1"
                  value={waccInputs.beta}
                  onChange={(e) => setWaccInputs({...waccInputs, beta: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* WACC Results */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">WACC Results</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-2xl font-bold text-blue-600">{waccResults.wacc}%</h3>
                <p className="text-gray-600">Weighted Average Cost of Capital</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Equity Weight</p>
                  <p className="text-lg font-semibold">{waccResults.equityWeight}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Debt Weight</p>
                  <p className="text-lg font-semibold">{waccResults.debtWeight}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">CAPM Cost of Equity</p>
                  <p className="text-lg font-semibold">{waccResults.capmCostOfEquity}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">After-Tax Cost of Debt</p>
                  <p className="text-lg font-semibold">{waccResults.afterTaxCostOfDebt}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* WACC Sensitivity Chart */}
          <div className="bg-white rounded-lg p-6 shadow-lg lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">WACC Sensitivity Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateSensitivityData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis yAxisId="left" label={{ value: 'WACC (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'NPV Index', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="wacc" stroke="#8884d8" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="npv" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Dilution Analysis Tab */}
      {activeTab === 'dilution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dilution Inputs */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Fundraising Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Shares Outstanding</label>
                <input
                  type="number"
                  value={dilutionInputs.currentShares}
                  onChange={(e) => setDilutionInputs({...dilutionInputs, currentShares: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Money Valuation ($)</label>
                <input
                  type="number"
                  value={dilutionInputs.preMoneyValuation}
                  onChange={(e) => setDilutionInputs({...dilutionInputs, preMoneyValuation: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fundraise Amount ($)</label>
                <input
                  type="number"
                  value={dilutionInputs.fundraiseAmount}
                  onChange={(e) => setDilutionInputs({...dilutionInputs, fundraiseAmount: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Liquidation Preference (x)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dilutionInputs.liquidationPreference}
                  onChange={(e) => setDilutionInputs({...dilutionInputs, liquidationPreference: parseFloat(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="participation"
                  checked={dilutionInputs.participationRights}
                  onChange={(e) => setDilutionInputs({...dilutionInputs, participationRights: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                />
                <label htmlFor="participation" className="text-sm font-medium text-gray-700">Participation Rights</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="prorata"
                  checked={dilutionInputs.proRataRights}
                  onChange={(e) => setDilutionInputs({...dilutionInputs, proRataRights: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                />
                <label htmlFor="prorata" className="text-sm font-medium text-gray-700">Pro Rata Rights</label>
              </div>
            </div>
          </div>

          {/* Dilution Results */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Dilution Impact</h2>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-2xl font-bold text-red-600">{dilutionResults.dilutionPercent}%</h3>
                <p className="text-gray-600">Ownership Dilution</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Price per Share</p>
                  <p className="text-lg font-semibold">${dilutionResults.pricePerShare}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">New Shares Issued</p>
                  <p className="text-lg font-semibold">{dilutionResults.newShares.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Post-Money Valuation</p>
                  <p className="text-lg font-semibold">${(dilutionResults.postMoneyValuation / 1000000).toFixed(0)}M</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Post-Raise Ownership</p>
                  <p className="text-lg font-semibold">{dilutionResults.ownershipPost}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dilution Visualization */}
          <div className="bg-white rounded-lg p-6 shadow-lg lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Ownership Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Pre-Money</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[{name: 'Existing Shareholders', value: 100}]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Post-Money</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        {name: 'Existing Shareholders', value: parseFloat(dilutionResults.ownershipPost)},
                        {name: 'New Investors', value: parseFloat(dilutionResults.dilutionPercent)}
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[{}, {}].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debt Stack Tab */}
      {activeTab === 'debt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Debt Stack Configuration */}
          <div className="bg-white rounded-lg p-6 shadow-lg lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Debt Stack Configuration</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Debt Type</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Amount ($M)</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Rate (%)</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Maturity (Years)</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Weight (%)</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Annual Interest ($M)</th>
                  </tr>
                </thead>
                <tbody>
                  {debtResults.debtLevels.map((debt, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-900">{debt.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{(debt.amount / 1000000).toFixed(0)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{debt.rate.toFixed(1)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{debt.maturity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{debt.weight}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{(debt.annualInterest / 1000000).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Debt Metrics */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Key Debt Metrics</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-2xl font-bold text-blue-600">{debtResults.totalLeverageRatio}x</h3>
                <p className="text-gray-600">Total Leverage Ratio</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Total Debt</p>
                  <p className="text-lg font-semibold">${(debtResults.totalDebt / 1000000).toFixed(0)}M</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Weighted Avg Cost</p>
                  <p className="text-lg font-semibold">{debtResults.weightedAverageCost}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Interest Coverage</p>
                  <p className="text-lg font-semibold">{debtResults.interestCoverage}x</p>
                </div>
              </div>
            </div>
          </div>

          {/* Debt Stack Visualization */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Debt Stack Composition</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={debtResults.debtLevels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${(value / 1000000).toFixed(0)}M`, 'Amount']} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialModelingSuite;