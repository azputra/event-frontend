// src/components/ColorPicker.js
import React from 'react';

const ColorPicker = ({ formData, setFormData }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Warna Background
      </label>
      <div className="flex items-center">
        <input
          type="color"
          name="backgroundColor"
          value={formData.backgroundColor || '#ffffff'}
          onChange={(e) => setFormData({
            ...formData,
            backgroundColor: e.target.value
          })}
          className="h-10 w-10 border-0 p-0 mr-2"
        />
        <input
          type="text"
          value={formData.backgroundColor || '#ffffff'}
          onChange={(e) => setFormData({
            ...formData,
            backgroundColor: e.target.value
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="#RRGGBB"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
        />
      </div>
      {/* <div 
        className="mt-2 h-12 w-full rounded-md border border-gray-300" 
        style={{ backgroundColor: formData.backgroundColor }}
      ></div> */}
    </div>
  );
};

export default ColorPicker;