/**
 * AI分析组件 (AIAnalysis.jsx)
 * 功能：
 * 1. AI战术建议生成
 * 2. 智能阵容推荐
 * 3. 比赛结果预测
 * 4. 自然语言查询界面
 * 5. AI分析结果展示面板
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// AI配置
// ============================================================

const AI_CONFIG = {
  // OpenAI API配置（生产环境应从环境变量读取）
  apiKey: 'YOUR_OPENAI_API_KEY',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.7,

  // 本地LLM配置（备选方案）
  localEndpoint: 'http://localhost:11434/api/generate',
  localModel: 'llama3',

  // 功能开关
  useLocalLLM: false,
  enableStreaming: true,
  enableCache: true,
};

// ============================================================
// 模拟AI响应（演示用，实际接入API后替换）
// ============================================================

const MOCK_AI_RESPONSES = {
  tactic: {
    title: 'AI战术建议',
    content: `## 战术分析报告

### 当前阵容评估
基于球队近期10场比赛的数据分析，当前4-3-3阵型在进攻端表现优异（场均进球2.1），但防守端存在隐患（场均失球1.3）。

### 战术建议

**1. 进攻策略优化**
- 利用边锋速度优势，增加边路突破传中频率
- 中场增加前插跑动，创造更多射门机会
- 定位球战术需要加强，目前转化率仅12%

**2. 防守调整**
- 建议采用高位逼抢策略，前场压迫成功率可提升至65%
- 中后卫需要加强空中对抗训练，头球争顶成功率仅58%
- 边后卫回防速度需要提升，对手反击时边路空档较大

**3. 关键球员使用**
- 张三（ST）：建议增加禁区内的触球次数，射门转化率32%为队内最高
- 李四（LW）：利用其速度优势（速度评分90），多打身后球
- 王五（CM）：作为组织核心，传球成功率89%，应承担更多进攻组织任务

### 推荐阵型
**4-2-3-1**：增强中场控制力，同时保持进攻火力`,
    timestamp: new Date().toISOString(),
  },

  lineup: {
    title: '智能阵容推荐',
    content: `## 最佳阵容推荐

### 推荐阵型：4-2-3-1

| 位置 | 球员 | 号码 | 能力值 | 推荐理由 |
|------|------|------|--------|----------|
| GK | 门将 | 1 | 82 | 扑救成功率78%，队内最佳 |
| LB | 左后卫 | 3 | 76 | 速度85，助攻能力强 |
| CB | 赵六 | 4 | 88 | 防守92，拦截72次队内第一 |
| CB | 中后卫 | 5 | 80 | 头球能力强，空中对抗率72% |
| RB | 右后卫 | 2 | 78 | 体能充沛，场均跑动11.2km |
| CDM | 后腰 | 6 | 82 | 抢断85次，防守覆盖面广 |
| CDM | 王五 | 8 | 86 | 传球89%，组织核心 |
| LW | 李四 | 7 | 85 | 速度90，突破能力强 |
| CAM | 前腰 | 10 | 83 | 创造力强，关键传球多 |
| RW | 刘七 | 11 | 82 | 速度91，内切射门威胁大 |
| ST | 张三 | 9 | 87 | 射门88，进球18个队内最佳 |

### 替补推荐
- 边锋替补：速度型球员，用于下半场冲击对手防线
- 中场替补：防守型中场，用于领先时加强防守
- 前锋替补：抢点型前锋，用于落后时增加进攻点

### 战术要点
1. 进攻时两翼齐飞，利用边锋速度优势
2. 防守时双后腰保护防线，形成4-2-3-1防守阵型
3. 定位球时中后卫前压，利用身高优势`,
    timestamp: new Date().toISOString(),
  },

  predict: {
    title: '比赛结果预测',
    content: `## 比赛预测分析

### 对手分析：球队X

**近期状态**
- 近5场战绩：3胜1平1负
- 场均进球：1.8
- 场均失球：1.1
- 核心球员：前锋A（12球）、中场B（8助攻）

**战术特点**
- 偏好4-4-2阵型
- 擅长防守反击
- 定位球威胁大（角球进球率18%）
- 弱点：边路防守速度偏慢

### 预测结果

**胜率分析**
| 结果 | 概率 | 关键因素 |
|------|------|----------|
| 胜 | 45% | 边路突破成功率高 |
| 平 | 30% | 中场控制力相当 |
| 负 | 25% | 被反击得分 |

**预测比分**：2-1（胜）

**关键对位**
1. 张三 vs 对方中卫：速度优势明显，预计能创造3-4次射门机会
2. 李四 vs 对方右后卫：速度差距大，边路突破成功率预计70%+
3. 王五 vs 对方中场核心：传球能力相当，中场争夺将是关键

### 比赛建议
1. 开场前15分钟高压逼抢，争取早进球
2. 注意防守对方反击，边后卫不要过度压上
3. 定位球防守需要特别注意，安排专人盯防对方头球好的球员
4. 60分钟后可根据比分调整战术`,
    timestamp: new Date().toISOString(),
  },

  query: {
    title: 'AI查询结果',
    content: '',
    timestamp: new Date().toISOString(),
  },
};

// ============================================================
// AI查询处理函数
// ============================================================

function processNaturalLanguageQuery(query) {
  const q = query.toLowerCase();

  if (q.includes('最佳射手') || q.includes('进球最多') || q.includes('谁进球')) {
    return `根据数据分析，**张三**（#9，ST）是球队最佳射手，本赛季已打入**18球**，射门转化率**32.1%**，每90分钟进球**0.69**个。他在禁区内的终结能力队内最强。`;
  }

  if (q.includes('助攻') || q.includes('传球最好')) {
    return `**李四**（#7，LW）是球队助攻王，本赛季贡献**14次助攻**，每90分钟助攻**0.56**次。**王五**（#8，CM）传球成功率最高，达到**89%**，是球队的组织核心。`;
  }

  if (q.includes('防守') || q.includes('抢断') || q.includes('拦截')) {
    return `**赵六**（#4，CB）是防守核心，本赛季完成**85次抢断**和**72次拦截**，防守能力评分**92分**，是后防线最可靠的球员。`;
  }

  if (q.includes('最快') || q.includes('速度')) {
    return `球队速度最快的球员是**刘七**（#11，RW），速度评分**91分**。其次是**李四**（#7，LW），速度评分**90分**。两人在边路的突破能力是球队重要的进攻武器。`;
  }

  if (q.includes('阵容') || q.includes('阵型') || q.includes('最佳')) {
    return `推荐使用**4-2-3-1阵型**：张三（ST）单箭头，李四和刘七分居两翼，王五担任组织核心，赵六领衔后防线。这个阵型攻守平衡，能充分发挥球员特点。`;
  }

  if (q.includes('弱点') || q.includes('问题') || q.includes('不足')) {
    return `球队目前的主要问题：1）定位球防守需要加强，角球失球率偏高；2）中场替补深度不足，核心球员疲劳时缺乏轮换；3）边后卫回防速度有时偏慢，容易被对手打反击。`;
  }

  if (q.includes('训练') || q.includes('提高') || q.includes('改进')) {
    return `训练建议：1）加强定位球攻防演练，特别是角球防守站位；2）增加边路传中训练，提高传中准确率；3）进行高位逼抢战术演练，提升前场压迫效率；4）安排体能专项训练，保证比赛末段体能充沛。`;
  }

  // 默认回答
  return `关于"${query}"的分析：根据现有数据，我建议您关注以下几个方面：1）球员个人数据表现；2）团队战术配合；3）对手特点分析。如需更详细的分析，请尝试更具体的问题，例如"谁是最佳射手"、"推荐什么阵型"、"球队有什么弱点"等。`;
}

// ============================================================
// AI API调用（模拟）
// ============================================================

async function callAIAPI(prompt, type) {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  // 返回模拟响应
  if (type === 'query') {
    return {
      ...MOCK_AI_RESPONSES.query,
      content: processNaturalLanguageQuery(prompt),
      timestamp: new Date().toISOString(),
    };
  }

  return {
    ...MOCK_AI_RESPONSES[type],
    timestamp: new Date().toISOString(),
  };
}

// ============================================================
// 子组件：AI战术建议
// ============================================================

const TacticAdvice = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const generateTactic = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await callAIAPI('分析球队战术并提出建议', 'tactic');
      setResult(response);
      onResult?.(response);
    } catch (err) {
      setError('AI分析失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <h3 className="ai-panel-title">🎯 AI战术建议</h3>
      <p className="ai-panel-desc">基于球队数据生成智能战术分析和优化建议</p>

      {!result && !loading && (
        <div className="ai-action-area">
          <p className="ai-hint">AI将分析球队近期表现、球员数据和对手特点，生成战术建议报告。</p>
          <button className="ai-generate-btn" onClick={generateTactic}>
            🤖 生成战术建议
          </button>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <p>AI正在分析球队数据，生成战术建议...</p>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <p>{error}</p>
          <button className="ai-retry-btn" onClick={generateTactic}>重试</button>
        </div>
      )}

      {result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <h4>{result.title}</h4>
            <span className="ai-timestamp">
              {new Date(result.timestamp).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="ai-result-content markdown-content">
            {result.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h3 key={i} className="md-h3">{line.replace('## ', '')}</h3>;
              }
              if (line.startsWith('### ')) {
                return <h4 key={i} className="md-h4">{line.replace('### ', '')}</h4>;
              }
              if (line.startsWith('**') && line.includes('**')) {
                return <p key={i} className="md-bold">{line}</p>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="md-li">{line.replace('- ', '')}</li>;
              }
              if (line.startsWith('|')) {
                return null; // 表格在下面单独处理
              }
              if (line.trim()) {
                return <p key={i} className="md-p">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>
          <button className="ai-regenerate-btn" onClick={generateTactic}>
            🔄 重新生成
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 子组件：智能阵容推荐
// ============================================================

const LineupRecommendation = ({ players, onResult }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [formation, setFormation] = useState('4-2-3-1');

  const formations = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '4-1-4-1', '3-4-3'];

  const generateLineup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await callAIAPI(`推荐${formation}阵型的最佳阵容`, 'lineup');
      setResult(response);
      onResult?.(response);
    } catch (err) {
      setError('阵容推荐失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <h3 className="ai-panel-title">👥 智能阵容推荐</h3>
      <p className="ai-panel-desc">根据球员状态和能力自动推荐最佳阵容配置</p>

      {!result && !loading && (
        <div className="ai-action-area">
          <div className="formation-selector">
            <label>选择阵型：</label>
            <div className="formation-chips">
              {formations.map((f) => (
                <button
                  key={f}
                  className={`formation-chip ${formation === f ? 'active' : ''}`}
                  onClick={() => setFormation(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button className="ai-generate-btn" onClick={generateLineup}>
            🤖 生成阵容推荐
          </button>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <p>AI正在分析球员数据，生成{formation}阵型最佳阵容...</p>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <p>{error}</p>
          <button className="ai-retry-btn" onClick={generateLineup}>重试</button>
        </div>
      )}

      {result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <h4>{result.title}</h4>
            <span className="ai-timestamp">
              {new Date(result.timestamp).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="ai-result-content markdown-content">
            {result.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h3 key={i} className="md-h3">{line.replace('## ', '')}</h3>;
              }
              if (line.startsWith('### ')) {
                return <h4 key={i} className="md-h4">{line.replace('### ', '')}</h4>;
              }
              if (line.startsWith('|')) {
                return null;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="md-li">{line.replace('- ', '')}</li>;
              }
              if (line.trim()) {
                return <p key={i} className="md-p">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>
          <button className="ai-regenerate-btn" onClick={generateLineup}>
            🔄 重新生成
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 子组件：比赛结果预测
// ============================================================

const MatchPrediction = ({ onResult }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [opponent, setOpponent] = useState('');

  const predictMatch = async () => {
    if (!opponent.trim()) {
      setError('请输入对手名称');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await callAIAPI(`预测对阵${opponent}的比赛结果`, 'predict');
      setResult(response);
      onResult?.(response);
    } catch (err) {
      setError('预测失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <h3 className="ai-panel-title">🔮 比赛结果预测</h3>
      <p className="ai-panel-desc">基于历史数据和对手分析预测比赛结果</p>

      {!result && !loading && (
        <div className="ai-action-area">
          <div className="opponent-input">
            <label>对手名称：</label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="输入对手球队名称..."
              className="ai-input"
              onKeyDown={(e) => e.key === 'Enter' && predictMatch()}
            />
          </div>
          <button
            className="ai-generate-btn"
            onClick={predictMatch}
            disabled={!opponent.trim()}
          >
            🤖 预测比赛结果
          </button>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <p>AI正在分析对手数据，预测比赛结果...</p>
        </div>
      )}

      {error && (
        <div className="ai-error">
          <p>{error}</p>
          <button className="ai-retry-btn" onClick={predictMatch}>重试</button>
        </div>
      )}

      {result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <h4>{result.title}</h4>
            <span className="ai-timestamp">
              {new Date(result.timestamp).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="ai-result-content markdown-content">
            {result.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h3 key={i} className="md-h3">{line.replace('## ', '')}</h3>;
              }
              if (line.startsWith('### ')) {
                return <h4 key={i} className="md-h4">{line.replace('### ', '')}</h4>;
              }
              if (line.startsWith('|')) {
                return null;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="md-li">{line.replace('- ', '')}</li>;
              }
              if (line.trim()) {
                return <p key={i} className="md-p">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>
          <button className="ai-regenerate-btn" onClick={predictMatch}>
            🔄 重新预测
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 子组件：自然语言查询
// ============================================================

const NaturalLanguageQuery = ({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const suggestedQueries = [
    '谁是最佳射手？',
    '助攻最多的是谁？',
    '防守最好的球员？',
    '推荐什么阵型？',
    '球队有什么弱点？',
    '如何改进训练？',
  ];

  const handleQuery = async (q) => {
    const queryText = q || query;
    if (!queryText.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await callAIAPI(queryText, 'query');
      setResult(response);
      setHistory((prev) => [
        { type: 'user', text: queryText, time: new Date() },
        { type: 'ai', text: response.content, time: new Date() },
        ...prev,
      ]);
      onResult?.(response);
      setQuery('');
    } catch (err) {
      setError('查询失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <h3 className="ai-panel-title">💬 AI智能问答</h3>
      <p className="ai-panel-desc">用自然语言提问，AI为您分析球队数据</p>

      {/* 建议问题 */}
      <div className="suggested-queries">
        <span className="suggested-label">试试问：</span>
        <div className="suggested-chips">
          {suggestedQueries.map((q, i) => (
            <button
              key={i}
              className="suggested-chip"
              onClick={() => handleQuery(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 查询输入 */}
      <div className="query-input-area">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入您的问题，例如：谁是最佳射手？"
          className="ai-input query-input"
          onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
          disabled={loading}
        />
        <button
          className="ai-send-btn"
          onClick={() => handleQuery()}
          disabled={loading || !query.trim()}
        >
          {loading ? '...' : '发送'}
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="ai-loading">
          <div className="ai-loading-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <p>AI正在分析...</p>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="ai-error">
          <p>{error}</p>
          <button className="ai-retry-btn" onClick={() => handleQuery()}>重试</button>
        </div>
      )}

      {/* 对话历史 */}
      {history.length > 0 && (
        <div className="chat-history">
          <h4 className="chat-history-title">对话记录</h4>
          {history.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.type}`}>
              <div className="chat-avatar">
                {msg.type === 'user' ? '👤' : '🤖'}
              </div>
              <div className="chat-bubble">
                <div className="chat-text">{msg.text}</div>
                <div className="chat-time">
                  {msg.time.toLocaleTimeString('zh-CN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 主组件：AIAnalysis
// ============================================================

const AIAnalysis = ({ players, onAnalysisComplete }) => {
  const [activeTab, setActiveTab] = useState('query');
  const [analysisResults, setAnalysisResults] = useState({});

  const tabs = [
    { key: 'query', label: '💬 智能问答', icon: '💬' },
    { key: 'tactic', label: '🎯 战术建议', icon: '🎯' },
    { key: 'lineup', label: '👥 阵容推荐', icon: '👥' },
    { key: 'predict', label: '🔮 比赛预测', icon: '🔮' },
  ];

  const handleResult = useCallback(
    (type, result) => {
      setAnalysisResults((prev) => ({ ...prev, [type]: result }));
      onAnalysisComplete?.({ type, result });
    },
    [onAnalysisComplete]
  );

  return (
    <div className="ai-analysis">
      {/* 标题栏 */}
      <div className="ai-header">
        <h2 className="ai-title">🤖 AI智能分析</h2>
        <p className="ai-subtitle">战术建议 · 阵容推荐 · 比赛预测 · 智能问答</p>
      </div>

      {/* 标签页导航 */}
      <div className="ai-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`ai-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 标签页内容 */}
      <div className="ai-content">
        {activeTab === 'query' && (
          <NaturalLanguageQuery
            onResult={(r) => handleResult('query', r)}
          />
        )}
        {activeTab === 'tactic' && (
          <TacticAdvice
            onResult={(r) => handleResult('tactic', r)}
          />
        )}
        {activeTab === 'lineup' && (
          <LineupRecommendation
            players={players}
            onResult={(r) => handleResult('lineup', r)}
          />
        )}
        {activeTab === 'predict' && (
          <MatchPrediction
            onResult={(r) => handleResult('predict', r)}
          />
        )}
      </div>

      {/* AI功能说明 */}
      <div className="ai-info">
        <h4>关于AI分析功能</h4>
        <ul>
          <li>AI分析基于球队历史数据和球员表现数据</li>
          <li>战术建议仅供参考，实际比赛需结合现场情况</li>
          <li>阵容推荐基于球员当前状态和能力评分</li>
          <li>比赛预测基于历史对阵数据和近期状态</li>
          <li>支持接入OpenAI API或本地LLM以获得更准确的分析</li>
        </ul>
      </div>
    </div>
  );
};

export default AIAnalysis;