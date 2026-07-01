'use client';

import { useState } from 'react';
import { Plus, Search, Receipt, Users, FileText } from 'lucide-react';
import { useAccountsStore, useAppStore } from '@/lib/stores';
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils';
import type { InvoiceStatus } from '@/types';

export default function AccountsPanel() {
  const { clients, invoices, getClientOutstanding } = useAccountsStore();
  const { openDrawer } = useAppStore();
  const [activeTab, setActiveTab] = useState<'invoices' | 'clients'>('invoices');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(invoice => {
    const client = clients.find(c => c.id === invoice.clientId);
    const matchesSearch = !search ||
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      client?.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<InvoiceStatus, string> = {
    draft: 'tag-info',
    sent: 'tag-warning',
    paid: 'tag-success',
    overdue: 'tag-error',
    cancelled: 'tag-info'
  };

  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.grandTotal, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card text-center">
          <div className="stat-label">Total Outstanding</div>
          <div className="stat-value text-warning">{formatCurrency(totalOutstanding)}</div>
        </div>
        <div className="stat-card text-center">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value text-lg">{invoices.length}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'invoices' ? 'bg-primary-700 text-white' : 'bg-dark-100 text-gray-400 hover:text-white'
          }`}
        >
          <Receipt size={14} className="inline mr-2" />
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'clients' ? 'bg-primary-700 text-white' : 'bg-dark-100 text-gray-400 hover:text-white'
          }`}
        >
          <Users size={14} className="inline mr-2" />
          Clients
        </button>
      </div>

      {activeTab === 'invoices' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'draft', 'sent', 'paid', 'overdue'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as InvoiceStatus | 'all')}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  statusFilter === status ? 'bg-primary-700 text-white' : 'bg-dark-100 text-gray-400 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="space-y-2">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {invoices.length === 0 ? 'No invoices yet' : 'No invoices match your filters'}
              </div>
            ) : (
              filteredInvoices.map(invoice => {
                const client = clients.find(c => c.id === invoice.clientId);
                const overdue = invoice.status === 'sent' && isOverdue(invoice.dueDate);

                return (
                  <div key={invoice.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`tag ${overdue ? 'tag-error' : statusColors[invoice.status]}`}>
                            {overdue ? 'overdue' : invoice.status}
                          </span>
                        </div>
                        <div className="font-medium text-white mt-1">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-400">{client?.name || 'Unknown Client'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">{formatCurrency(invoice.grandTotal)}</div>
                        <div className="text-xs text-gray-500">SAC: {invoice.sacCode}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-dark-100/50 rounded p-2">
                        <div className="text-gray-500">Subtotal</div>
                        <div className="text-white">{formatCurrency(invoice.subtotal)}</div>
                      </div>
                      <div className="bg-dark-100/50 rounded p-2">
                        <div className="text-gray-500">GST</div>
                        <div className="text-white">{formatCurrency(invoice.cgst + invoice.sgst + invoice.igst)}</div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Invoice: {formatDate(invoice.invoiceDate)}</span>
                      <span>Due: {formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'clients' && (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="space-y-2">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {clients.length === 0 ? 'No clients added yet' : 'No clients match your search'}
              </div>
            ) : (
              filteredClients.map(client => {
                const outstanding = getClientOutstanding(client.id);
                const clientInvoices = invoices.filter(i => i.clientId === client.id);

                return (
                  <div key={client.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-700/30 flex items-center justify-center">
                          <Users size={18} className="text-primary-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{client.name}</div>
                          <div className="text-xs text-gray-500">{client.city}, {client.state}</div>
                          {client.gstin && (
                            <div className="text-xs text-gray-500">GSTIN: {client.gstin}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{clientInvoices.length} invoices</div>
                        <div className={`text-sm font-medium ${outstanding > 0 ? 'text-warning' : 'text-success'}`}>
                          {formatCurrency(outstanding)}
                        </div>
                        <div className="text-xs text-gray-500">outstanding</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Contact: {client.contactPerson} ({client.phone})
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
