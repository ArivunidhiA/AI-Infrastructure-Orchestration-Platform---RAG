import React, { useState } from 'react';
import { 
  Home, 
  Server, 
  TrendingUp, 
  BarChart3, 
  MessageSquare, 
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { MenuItem, MenuContainer } from './ui/fluid-menu';

const Sidebar = ({ isOpen, onClose, currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'workloads', label: 'Workloads', icon: Server },
    { id: 'optimization', label: 'Cost Optimizer', icon: TrendingUp },
    { id: 'monitoring', label: 'Monitoring', icon: BarChart3 },
    { id: 'rag', label: 'AI Assistant', icon: MessageSquare },
  ];

  const handleItemClick = (itemId) => {
    onPageChange(itemId);
  };

  return (
    <div className="fixed left-4 top-24 z-50">
      <MenuContainer>
        <MenuItem 
          icon={
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
                <MenuIcon size={24} strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
                <X size={24} strokeWidth={1.5} />
              </div>
            </div>
          } 
        />
        {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
            <MenuItem 
                  key={item.id}
              icon={<Icon size={24} strokeWidth={1.5} />}
              onClick={() => handleItemClick(item.id)}
              isActive={isActive}
              label={item.label}
            />
              );
            })}
      </MenuContainer>
        </div>
  );
};

export default Sidebar;
