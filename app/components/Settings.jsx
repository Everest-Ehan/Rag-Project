"use client"

import { useState } from 'react'

export default function Settings({ clientId }) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: true,
    language: 'en',
    chunkSize: 1000,
    maxTokens: 4000
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const settingGroups = [
    {
      title: 'General',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      settings: [
        { key: 'notifications', label: 'Enable Notifications', description: 'Receive alerts for important updates', type: 'toggle' },
        { key: 'autoSave', label: 'Auto Save', description: 'Automatically save your work', type: 'toggle' },
        { key: 'language', label: 'Language', description: 'Choose your preferred language', type: 'select', options: [ { value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' } ] }
      ]
    },
    {
      title: 'AI Configuration',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      settings: [
        { key: 'chunkSize', label: 'Chunk Size', description: 'Size of document chunks for processing', type: 'range', min: 500, max: 2000, step: 100 },
        { key: 'maxTokens', label: 'Max Tokens', description: 'Maximum tokens for AI responses', type: 'range', min: 1000, max: 8000, step: 500 }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-200">Settings</h2>
        <p className="text-sm text-gray-400">Configure your application preferences</p>
      </div>
      <div className="space-y-6">
        {settingGroups.map((group) => (
          <div key={group.title} className="neuro-card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 neuro-card-inset rounded-xl flex items-center justify-center">
                {group.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-200">{group.title}</h3>
                <p className="text-sm text-gray-500">Configure {group.title.toLowerCase()} settings</p>
              </div>
            </div>
            <div className="space-y-4">
              {group.settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-200">{setting.label}</h4>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <div className="ml-4">
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => handleSettingChange(setting.key, !settings[setting.key])}
                        className={`neuro-toggle ${settings[setting.key] ? 'active' : ''}`}
                      />
                    )}
                    {setting.type === 'select' && (
                      <select
                        value={settings[setting.key]}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="neuro-input w-32"
                      >
                        {setting.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {setting.type === 'range' && (
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min={setting.min}
                          max={setting.max}
                          step={setting.step}
                          value={settings[setting.key]}
                          onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value))}
                          className="neuro-input w-24"
                        />
                        <span className="text-sm text-gray-300 w-12 text-right">
                          {settings[setting.key]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="neuro-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 neuro-card-inset rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">API Configuration</h3>
            <p className="text-sm text-gray-500">Manage your API keys and connections</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="neuro-card-inset p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-200">OpenAI API Key</h4>
                <p className="text-sm text-gray-500">Configure your OpenAI API key for AI features</p>
              </div>
              <button className="neuro-btn">Configure</button>
            </div>
          </div>
          <div className="neuro-card-inset p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-200">ChromaDB Connection</h4>
                <p className="text-sm text-gray-500">Vector database connection status</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 