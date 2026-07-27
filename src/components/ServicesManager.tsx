import React, { useState } from 'react';
import { Category, Service, CompanyDetails } from '../types';
import { capitalizeWords } from '../lib/storage';
import { 
  Sparkles, 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Clock, 
  DollarSign, 
  Filter, 
  Check, 
  X, 
  AlertTriangle,
  FolderPlus,
  LayoutGrid,
  List,
  Tag,
  CheckCircle2
} from 'lucide-react';

interface ServicesManagerProps {
  services: Service[];
  categories: Category[];
  company: CompanyDetails;
  onAddService: (service: Omit<Service, 'id' | 'createdAt'>) => void;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => { success: boolean; message?: string };
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  services,
  categories,
  company,
  onAddService,
  onEditService,
  onDeleteService,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'categories'>('services');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter state for Services
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState<{
    name: string;
    categoryId: string;
    durationMinutes: number;
    price: number;
    description: string;
    isActive: boolean;
  }>({
    name: '',
    categoryId: categories[0]?.id || '',
    durationMinutes: 60,
    price: 3000,
    description: '',
    isActive: true,
  });

  // Delete Confirm Modal for Service
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    description: string;
    color: string;
  }>({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  // Delete Category state
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [categoryDeleteError, setCategoryDeleteError] = useState<string | null>(null);

  const availableColors = [
    '#3b82f6', '#ec4899', '#10b981', '#8b5cf6', '#06b6d4', 
    '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#059669'
  ];

  // Filtered Services list
  const filteredServices = services.filter((srv) => {
    const matchesSearch = 
      srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategoryFilter === 'all' || srv.categoryId === selectedCategoryFilter;

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && srv.isActive) || 
      (statusFilter === 'inactive' && !srv.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Open Service Modal for Creation or Edit
  const handleOpenServiceModal = (serviceToEdit?: Service) => {
    if (serviceToEdit) {
      setEditingService(serviceToEdit);
      setServiceFormData({
        name: serviceToEdit.name,
        categoryId: serviceToEdit.categoryId,
        durationMinutes: serviceToEdit.durationMinutes,
        price: serviceToEdit.price,
        description: serviceToEdit.description,
        isActive: serviceToEdit.isActive,
      });
    } else {
      setEditingService(null);
      setServiceFormData({
        name: '',
        categoryId: categories[0]?.id || '',
        durationMinutes: 60,
        price: 3000,
        description: '',
        isActive: true,
      });
    }
    setIsServiceModalOpen(true);
  };

  // Submit Service Form
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name.trim() || !serviceFormData.categoryId) return;

    const formattedData = {
      ...serviceFormData,
      name: capitalizeWords(serviceFormData.name.trim())
    };

    if (editingService) {
      onEditService({
        ...editingService,
        ...formattedData,
      });
    } else {
      onAddService(formattedData);
    }
    setIsServiceModalOpen(false);
  };

  // Handle Open Category Modal
  const handleOpenCategoryModal = (categoryToEdit?: Category) => {
    if (categoryToEdit) {
      setEditingCategory(categoryToEdit);
      setCategoryFormData({
        name: categoryToEdit.name,
        description: categoryToEdit.description,
        color: categoryToEdit.color,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        color: availableColors[Math.floor(Math.random() * availableColors.length)],
      });
    }
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    if (editingCategory) {
      onEditCategory({
        ...editingCategory,
        ...categoryFormData,
      });
    } else {
      onAddCategory({
        ...categoryFormData,
        iconName: 'Sparkles',
      });
    }
    setIsCategoryModalOpen(false);
  };

  // Delete Category action
  const handleConfirmDeleteCategory = (catId: string) => {
    const res = onDeleteCategory(catId);
    if (res.success) {
      setDeletingCategoryId(null);
      setCategoryDeleteError(null);
    } else {
      setCategoryDeleteError(res.message || 'Cannot delete category in use');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header & Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Service Catalog Management
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Treatments & Category Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add, update, or reorganize your spa services, pricing, durations, and service groups.
          </p>
        </div>

        {/* Sub-tab Switcher (Services vs Categories) */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('services')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'services'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="tab-services-list"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Services ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'categories'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="tab-categories-list"
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Categories ({categories.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SERVICES MANAGEMENT TAB CONTENT */}
      {/* ========================================================= */}
      {activeSubTab === 'services' && (
        <div className="space-y-5">
          
          {/* Controls Bar: Search, Category Filter, View Mode, Add Service Button */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search service title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Category:</span>
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories ({services.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* View Mode Toggle & Add Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleOpenServiceModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                id="add-new-service-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

          </div>

          {/* Grid View of Services */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => {
                const category = categories.find((c) => c.id === service.categoryId);

                return (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Top category badge & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span 
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs"
                          style={{ backgroundColor: category?.color || '#0ea5e9' }}
                        >
                          {category?.name || 'General'}
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onEditService({ ...service, isActive: !service.isActive })}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                              service.isActive 
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                            title="Click to toggle status"
                          >
                            {service.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {service.description || 'No detailed description provided.'}
                      </p>
                    </div>

                    {/* Footer info: Duration, Price, Action buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {service.durationMinutes}m
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {company.currency || 'KES'} {service.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenServiceModal(service)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                          title="Edit Service"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingServiceId(service.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredServices.length === 0 && (
                <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                  <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">No services found</h4>
                  <p className="text-xs max-w-sm mx-auto">
                    Try adjusting your search criteria or add a new service to your spa catalog.
                  </p>
                  <button
                    onClick={() => handleOpenServiceModal()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table View of Services */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5">Service Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {filteredServices.map((srv) => {
                      const cat = categories.find((c) => c.id === srv.categoryId);
                      return (
                        <tr key={srv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                            <div>{srv.name}</div>
                            <div className="text-[11px] font-normal text-slate-400 line-clamp-1">{srv.description}</div>
                          </td>
                          <td className="p-3.5">
                            <span 
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                              style={{ backgroundColor: cat?.color || '#3b82f6' }}
                            >
                              {cat?.name || 'General'}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono">{srv.durationMinutes} mins</td>
                          <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {company.currency || 'KES'} {srv.price.toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              srv.isActive 
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {srv.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => handleOpenServiceModal(srv)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingServiceId(srv.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* CATEGORIES MANAGEMENT TAB CONTENT */}
      {/* ========================================================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-5">
          
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                Category Classifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Group spa treatments into clean categories with custom visual colors.
              </p>
            </div>

            <button
              onClick={() => handleOpenCategoryModal()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              id="add-new-category-btn"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const assignedServices = services.filter((s) => s.categoryId === cat.id);

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        ></span>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                          {cat.name}
                        </h4>
                      </div>

                      <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {assignedServices.length} Treatments
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                      {cat.description || 'No category description set.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {cat.id}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCategoryDeleteError(null);
                          setDeletingCategoryId(cat.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SERVICE MODAL (ADD / EDIT) */}
      {/* ========================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                {editingService ? 'Edit Spa Service' : 'Add New Spa Service'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              
              {/* Service Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Tissue Muscle Massage"
                  value={serviceFormData.name}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Service Category *
                </label>
                <select
                  required
                  value={serviceFormData.categoryId}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration & Price Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={5}
                      max={480}
                      step={5}
                      required
                      value={serviceFormData.durationMinutes}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, durationMinutes: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Price ({company.currency || 'KES'})
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      step={50}
                      required
                      value={serviceFormData.price}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, price: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe treatment benefits, products used, or recommendations..."
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Is Active checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-service-is-active"
                  checked={serviceFormData.isActive}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="modal-service-is-active" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Service is active & available in bookings/POS
                </label>
              </div>

              {/* Modal buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CATEGORY MODAL (ADD / EDIT) */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scaleUp space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydrotherapy & Steam"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of treatments in this category..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Badge Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setCategoryFormData({ ...categoryFormData, color: hex })}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        categoryFormData.color === hex 
                          ? 'border-slate-900 dark:border-white scale-110 shadow-md' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {categoryFormData.color === hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md active:scale-95"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE SERVICE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingServiceId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete Spa Service?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove this service from your catalog? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeletingServiceId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteService(deletingServiceId);
                  setDeletingServiceId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CATEGORY CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingCategoryId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete Category?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will remove the category classification. Categories containing assigned services cannot be deleted until services are reassigned.
              </p>
              {categoryDeleteError && (
                <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-[11px] font-bold text-red-600 dark:text-red-400">
                  {categoryDeleteError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setDeletingCategoryId(null);
                  setCategoryDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteCategory(deletingCategoryId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
