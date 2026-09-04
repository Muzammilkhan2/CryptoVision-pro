/* ============================================
   CryptoVision Pro - Chart Initialization
   All ECharts configurations and renders
   ============================================ */

const ChartManager = {
    charts: {},
    currentCurrency: 'BTC',
    currentTimeframe: '1D',
    
    // ============================================
    // Initialize All Charts
    // ============================================
    init() {
        this.initPriceChart();
        this.initTVLChart();
        this.initOnChainChart();
        this.initFearGreedGauge();
        this.initMarketCapChart();
        
        // Handle window resize
        window.addEventListener('resize', CryptoUtils.debounce(() => {
            Object.values(this.charts).forEach(chart => {
                if (chart && !chart.isDisposed()) {
                    chart.resize();
                }
            });
        }, 300));
    },
    
    // ============================================
    // Price Chart (Candlestick + Volume)
    // ============================================
    initPriceChart() {
        const container = document.getElementById('priceChart');
        this.charts.price = echarts.init(container);
        this.updatePriceChart(this.currentCurrency, this.currentTimeframe);
    },
    
    updatePriceChart(currency = 'BTC', timeframe = '1D') {
        const basePrices = {
            'BTC': 67000,
            'ETH': 3400,
            'BNB': 590,
            'SOL': 152,
            'ADA': 0.6
        };
        
        const days = { '1H': 1, '4H': 3, '1D': 30, '1W': 90, '1M': 180 }[timeframe];
        const data = CryptoUtils.generatePriceData(days, basePrices[currency]);
        
        const dates = data.map(d => d.date);
        const ohlcData = data.map(d => [d.open, d.close, d.low, d.high]);
        const volumeData = data.map(d => d.volume);
        
        const option = {
            backgroundColor: 'transparent',
            grid: [
                { left: '8%', right: '5%', top: '10%', height: '60%' },
                { left: '8%', right: '5%', top: '75%', height: '15%' }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: dates,
                    boundaryGap: true,
                    axisLine: { lineStyle: { color: '#64748b' } },
                    axisLabel: { color: '#94a3b8', fontSize: 11 },
                    gridIndex: 0
                },
                {
                    type: 'category',
                    data: dates,
                    boundaryGap: true,
                    axisLine: { lineStyle: { color: '#64748b' } },
                    axisLabel: { show: false },
                    gridIndex: 1
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    scale: true,
                    splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.2)' } },
                    axisLine: { lineStyle: { color: '#64748b' } },
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 11,
                        formatter: (value) => '$' + CryptoUtils.formatLargeNumber(value)
                    },
                    gridIndex: 0
                },
                {
                    type: 'value',
                    scale: true,
                    splitLine: { show: false },
                    axisLine: { lineStyle: { color: '#64748b' } },
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 11,
                        formatter: (value) => CryptoUtils.formatLargeNumber(value)
                    },
                    gridIndex: 1
                }
            ],
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
                backgroundColor: 'rgba(30, 41, 59, 0.98)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
                textStyle: { color: '#f1f5f9', fontSize: 12 },
                formatter: function(params) {
                    let result = `<div style="font-weight: 700; margin-bottom: 8px;">${params[0].name}</div>`;
                    const ohlc = params[0].data;
                    const volume = params[1].value;
                    
                    result += `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: 'JetBrains Mono', monospace;">
                            <div>Open: <span style="color: #00d4ff;">${CryptoUtils.formatCurrency(ohlc[0])}</span></div>
                            <div>High: <span style="color: #10b981;">${CryptoUtils.formatCurrency(ohlc[3])}</span></div>
                            <div>Close: <span style="color: #00d4ff;">${CryptoUtils.formatCurrency(ohlc[1])}</span></div>
                            <div>Low: <span style="color: #ff0055;">${CryptoUtils.formatCurrency(ohlc[2])}</span></div>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(100, 116, 139, 0.3);">
                            Volume: <span style="color: #8b5cf6;">${CryptoUtils.formatLargeNumber(volume)}</span>
                        </div>
                    `;
                    return result;
                }
            },
            series: [
                {
                    name: 'Price',
                    type: 'candlestick',
                    data: ohlcData,
                    itemStyle: {
                        color: '#10b981',
                        color0: '#ff0055',
                        borderColor: '#10b981',
                        borderColor0: '#ff0055'
                    },
                    xAxisIndex: 0,
                    yAxisIndex: 0
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    data: volumeData,
                    itemStyle: {
                        color: function(params) {
                            const dataIndex = params.dataIndex;
                            const ohlc = ohlcData[dataIndex];
                            return ohlc[1] >= ohlc[0] 
                                ? 'rgba(16, 185, 129, 0.6)' 
                                : 'rgba(255, 0, 85, 0.6)';
                        }
                    },
                    xAxisIndex: 1,
                    yAxisIndex: 1
                }
            ]
        };
        
        this.charts.price.setOption(option);
    },
    
    // ============================================
    // DeFi TVL Ranking Chart (Horizontal Bar)
    // ============================================
    initTVLChart() {
        const container = document.getElementById('tvlChart');
        this.charts.tvl = echarts.init(container);
        
        const data = CryptoUtils.generateDeFiData();
        const names = data.map(d => d.logo + ' ' + d.name);
        const tvls = data.map(d => d.tvl);
        const changes = data.map(d => d.change24h);
        
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '18%',
                right: '12%',
                top: '5%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#64748b' } },
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 11,
                    formatter: (value) => '$' + CryptoUtils.formatLargeNumber(value)
                },
                splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.2)' } }
            },
            yAxis: {
                type: 'category',
                data: names,
                axisLine: { lineStyle: { color: '#64748b' } },
                axisLabel: {
                    color: '#f1f5f9',
                    fontSize: 13,
                    fontWeight: 600
                },
                axisTick: { show: false }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(30, 41, 59, 0.98)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
                textStyle: { color: '#f1f5f9', fontSize: 12 },
                formatter: function(params) {
                    const index = params[0].dataIndex;
                    const protocol = data[index];
                    const changeColor = protocol.change24h >= 0 ? '#10b981' : '#ff0055';
                    const changeSign = protocol.change24h >= 0 ? '+' : '';
                    
                    return `
                        <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">
                            ${protocol.logo} ${protocol.name}
                        </div>
                        <div style="font-family: 'JetBrains Mono', monospace;">
                            TVL: <span style="color: #00d4ff; font-weight: 700;">${CryptoUtils.formatCurrency(protocol.tvl, 0)}</span>
                        </div>
                        <div style="font-family: 'JetBrains Mono', monospace; margin-top: 4px;">
                            24h: <span style="color: ${changeColor}; font-weight: 700;">${changeSign}${protocol.change24h.toFixed(2)}%</span>
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(100, 116, 139, 0.3);">
                            <div style="font-size: 11px; color: #94a3b8;">Chains: ${protocol.chains.join(', ')}</div>
                        </div>
                    `;
                }
            },
            series: [
                {
                    name: 'TVL',
                    type: 'bar',
                    data: tvls,
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#8b5cf6' },
                            { offset: 1, color: '#00d4ff' }
                        ]),
                        borderRadius: [0, 4, 4, 0]
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: function(params) {
                            const index = params.dataIndex;
                            const change = changes[index];
                            const color = change >= 0 ? '#10b981' : '#ff0055';
                            const sign = change >= 0 ? '+' : '';
                            return `{value|${CryptoUtils.formatCurrency(params.value, 0)}} {change|${sign}${change.toFixed(2)}%}`;
                        },
                        rich: {
                            value: {
                                color: '#f1f5f9',
                                fontWeight: 700,
                                fontSize: 12,
                                fontFamily: 'JetBrains Mono'
                            },
                            change: {
                                fontSize: 11,
                                fontWeight: 600,
                                fontFamily: 'JetBrains Mono'
                            }
                        }
                    },
                    barWidth: '60%'
                }
            ]
        };
        
        this.charts.tvl.setOption(option);
    },
    
    // ============================================
    // On-Chain Data Chart (Dual Y-Axis)
    // ============================================
    initOnChainChart() {
        const container = document.getElementById('onchainChart');
        this.charts.onchain = echarts.init(container);
        
        const data = CryptoUtils.generateOnChainData();
        const dates = data.map(d => d.date);
        const volumes = data.map(d => d.volume / 1e9); // Convert to billions
        const addresses = data.map(d => d.activeAddresses / 1000); // Convert to thousands
        
        const option = {
            backgroundColor: 'transparent',
            legend: {
                data: ['Transaction Volume', 'Active Addresses'],
                textStyle: { color: '#f1f5f9', fontSize: 12 },
                top: '5%',
                icon: 'circle'
            },
            grid: {
                left: '8%',
                right: '8%',
                top: '18%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                boundaryGap: false,
                axisLine: { lineStyle: { color: '#64748b' } },
                axisLabel: { color: '#94a3b8', fontSize: 11 }
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Volume (B USD)',
                    nameTextStyle: { color: '#00d4ff', fontSize: 12 },
                    axisLine: { lineStyle: { color: '#00d4ff' } },
                    axisLabel: {
                        color: '#00d4ff',
                        fontSize: 11,
                        formatter: '{value}B'
                    },
                    splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.2)' } }
                },
                {
                    type: 'value',
                    name: 'Addresses (K)',
                    nameTextStyle: { color: '#10b981', fontSize: 12 },
                    axisLine: { lineStyle: { color: '#10b981' } },
                    axisLabel: {
                        color: '#10b981',
                        fontSize: 11,
                        formatter: '{value}K'
                    },
                    splitLine: { show: false }
                }
            ],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(30, 41, 59, 0.98)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
                textStyle: { color: '#f1f5f9', fontSize: 12 },
                formatter: function(params) {
                    let result = `<div style="font-weight: 700; margin-bottom: 8px;">${params[0].name}</div>`;
                    result += `<div style="font-family: 'JetBrains Mono', monospace;">`;
                    result += `Volume: <span style="color: #00d4ff; font-weight: 700;">$${params[0].value.toFixed(2)}B</span><br/>`;
                    result += `Active Addresses: <span style="color: #10b981; font-weight: 700;">${params[1].value.toFixed(0)}K</span>`;
                    result += `</div>`;
                    return result;
                }
            },
            series: [
                {
                    name: 'Transaction Volume',
                    type: 'line',
                    yAxisIndex: 0,
                    data: volumes,
                    smooth: true,
                    lineStyle: { color: '#00d4ff', width: 2 },
                    itemStyle: { color: '#00d4ff' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
                            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
                        ])
                    }
                },
                {
                    name: 'Active Addresses',
                    type: 'line',
                    yAxisIndex: 1,
                    data: addresses,
                    smooth: true,
                    lineStyle: { color: '#10b981', width: 2 },
                    itemStyle: { color: '#10b981' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                        ])
                    }
                }
            ]
        };
        
        this.charts.onchain.setOption(option);
    },
    
    // ============================================
    // Fear & Greed Gauge
    // ============================================
    initFearGreedGauge() {
        const container = document.getElementById('fearGreedGauge');
        this.charts.fearGreed = echarts.init(container);
        
        const value = CryptoUtils.calculateFearGreedIndex();
        const color = CryptoUtils.getFearGreedColor(value);
        const label = CryptoUtils.getFearGreedLabel(value);
        
        const option = {
            backgroundColor: 'transparent',
            series: [
                {
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    radius: '90%',
                    center: ['50%', '70%'],
                    splitNumber: 5,
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [
                                [0.25, '#ff0055'],
                                [0.45, '#ff6b35'],
                                [0.55, '#fbbf24'],
                                [0.75, '#10b981'],
                                [1, '#059669']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: {
                            color: color,
                            shadowColor: color,
                            shadowBlur: 10
                        },
                        length: '60%',
                        width: 6
                    },
                    axisTick: {
                        distance: -20,
                        length: 8,
                        lineStyle: {
                            color: 'rgba(100, 116, 139, 0.5)',
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: -20,
                        length: 15,
                        lineStyle: {
                            color: 'rgba(100, 116, 139, 0.8)',
                            width: 3
                        }
                    },
                    axisLabel: {
                        color: '#94a3b8',
                        distance: 15,
                        fontSize: 12,
                        fontWeight: 600
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: function(value) {
                            return `{value|${value}}\n{label|${CryptoUtils.getFearGreedLabel(value)}}`;
                        },
                        rich: {
                            value: {
                                fontSize: 56,
                                fontWeight: 800,
                                color: color,
                                lineHeight: 60,
                                fontFamily: 'Inter'
                            },
                            label: {
                                fontSize: 18,
                                fontWeight: 700,
                                color: '#f1f5f9',
                                lineHeight: 24
                            }
                        },
                        offsetCenter: [0, '-10%']
                    },
                    data: [{ value: value }]
                }
            ]
        };
        
        this.charts.fearGreed.setOption(option);
        
        // Animate the gauge periodically
        setInterval(() => {
            const newValue = CryptoUtils.calculateFearGreedIndex();
            const newColor = CryptoUtils.getFearGreedColor(newValue);
            
            this.charts.fearGreed.setOption({
                series: [{
                    pointer: {
                        itemStyle: {
                            color: newColor,
                            shadowColor: newColor
                        }
                    },
                    detail: {
                        rich: {
                            value: { color: newColor }
                        }
                    },
                    data: [{ value: newValue }]
                }]
            });
        }, 30000); // Update every 30 seconds
    },
    
    // ============================================
    // Market Cap Chart (Bar)
    // ============================================
    initMarketCapChart() {
        const container = document.getElementById('marketCapChart');
        this.charts.marketCap = echarts.init(container);
        
        const data = CryptoUtils.generateMarketCapData();
        const names = data.map(d => d.symbol);
        const caps = data.map(d => d.marketCap / 1e9); // Convert to billions
        const colors = data.map(d => d.color);
        
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '8%',
                right: '5%',
                top: '8%',
                bottom: '8%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: names,
                axisLine: { lineStyle: { color: '#64748b' } },
                axisLabel: {
                    color: '#f1f5f9',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono'
                }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#64748b' } },
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 11,
                    formatter: '{value}B'
                },
                splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.2)' } }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(30, 41, 59, 0.98)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
                borderWidth: 1,
                textStyle: { color: '#f1f5f9', fontSize: 12 },
                formatter: function(params) {
                    const index = params[0].dataIndex;
                    const crypto = data[index];
                    const changeColor = crypto.change24h >= 0 ? '#10b981' : '#ff0055';
                    const changeSign = crypto.change24h >= 0 ? '+' : '';
                    
                    return `
                        <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">
                            ${crypto.name} (${crypto.symbol})
                        </div>
                        <div style="font-family: 'JetBrains Mono', monospace;">
                            Market Cap: <span style="color: #00d4ff; font-weight: 700;">$${(crypto.marketCap / 1e9).toFixed(2)}B</span>
                        </div>
                        <div style="font-family: 'JetBrains Mono', monospace; margin-top: 4px;">
                            24h: <span style="color: ${changeColor}; font-weight: 700;">${changeSign}${crypto.change24h.toFixed(2)}%</span>
                        </div>
                    `;
                }
            },
            series: [
                {
                    name: 'Market Cap',
                    type: 'bar',
                    data: caps,
                    itemStyle: {
                        color: function(params) {
                            return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: colors[params.dataIndex] },
                                { offset: 1, color: 'rgba(0, 212, 255, 0.3)' }
                            ]);
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '70%'
                }
            ]
        };
        
        this.charts.marketCap.setOption(option);
    }
};

// Export for use in main.js
window.ChartManager = ChartManager;
