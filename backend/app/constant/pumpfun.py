from app.constant.config import BITQUERY_TOKEN


BITQUERY_URL = "https://streaming.bitquery.io/eap"  
BITQUERY_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {BITQUERY_TOKEN}" 
}

TOP_HOLDERS_QUERY = """
query MyQuery($token: String!) {
  Solana(dataset: realtime) {
    BalanceUpdates(
      limit: { count: 10 }
      orderBy: { descendingByField: "BalanceUpdate_Holding_maximum" }
      where: {
        BalanceUpdate: {
          Currency: {
            MintAddress: { is: $token }
          }
        }
        Transaction: { Result: { Success: true } }
      }
    ) {
      BalanceUpdate {
        Currency {
          Name
          MintAddress
          Symbol
        }
        Account {
          Address
        }
        Holding: PostBalance(maximum: Block_Slot)
      }
    }
  }
}
"""

DEV_HOLDINGS_QUERY = """
query MyQuery($dev: String!, $token: String!) {
  Solana {
    BalanceUpdates(
      where: {
        BalanceUpdate: {
          Account: { Address: { is: $dev } }
          Currency: { MintAddress: { is: $token } }
        }
      }
    ) {
      BalanceUpdate {
        balance: PostBalance(maximum: Block_Slot)
      }
    }
  }
}
"""

HOLDER_DISTRIBUTION_QUERY="""
query HolderDistribution($token: String!) {
  Solana {
    BalanceUpdates(
      orderBy: { descendingByField: "BalanceUpdate_Holding_maximum" }
      where: {
        BalanceUpdate: {
          Currency: {
            MintAddress: { is: $token }
          }
        }
        Transaction: { Result: { Success: true } }
      }
    ) {
      BalanceUpdate {
        Account {
          Address
        }
        Holding: PostBalance(maximum: Block_Slot)
      }
    }
  }
}
"""

VOLUME_AND_MARKETCAP_QUERY="""
query MyQuery($time_1h_ago: DateTime, $token: String, $side: String) {
  Solana {
    liquidity: DEXPools(
      where: {Pool: {Market: {BaseCurrency: {MintAddress: {is: $token}}, QuoteCurrency: {MintAddress: {is: $side}}}, Dex: {ProtocolName: {is: "pump"}}}}
      limit: {count: 1}
      orderBy: {descending: Block_Time}
    ) {
      Pool {
        Base {
          PostAmountInUSD
        }
      }
    }
    marketcap: TokenSupplyUpdates(
      where: {TokenSupplyUpdate: {Currency: {MintAddress: {is: $token}}}, Block: {Time: {till: $time_1h_ago}}}
      limitBy: {by: TokenSupplyUpdate_Currency_MintAddress, count: 1}
      orderBy: {descending: Block_Time}
    ) {
      TokenSupplyUpdate {
        PostBalanceInUSD
        Currency {
          Name
          MintAddress
          Symbol
        }
      }
    }
  }
}
"""

TOP_MARKET_CAP_PUMPFUN_COIN = """
query TopMarketCapCoin {
  Solana {
    TokenSupplyUpdates(
      limit: {count: 10}
      orderBy: {descendingByField: "TokenSupplyUpdate_Marketcap"}
      limitBy: {by: TokenSupplyUpdate_Currency_MintAddress, count: 1}
      where: {TokenSupplyUpdate: {Currency: {MintAddress: {includes: "pump"}}}}
    ) {
      TokenSupplyUpdate {
        Marketcap: PostBalanceInUSD
        Currency {
          Name
          Symbol
          MintAddress
          Fungible
          Decimals
        }
      }
    }
  }
}
"""

GET_TOKEN_INFORMATION = """
query TokenTradesInfo($token: String!, $before_timestamp: DateTime!) {
  Solana(dataset: realtime) {
    DEXTradeByTokens(
      where: {
        Transaction: {Result: {Success: true}}, 
        Trade: {
          Currency: {MintAddress: {is: $token}}
        }, 
        Block: {Time: {since: $before_timestamp}}}
    ) {
      Trade {
        Currency {
          Name
          MintAddress
          Symbol
        }
        start: PriceInUSD(minimum: Block_Time)
        end: PriceInUSD(maximum: Block_Time)
        Dex {
          ProtocolName
          ProtocolFamily
          ProgramAddress
        }
        Market {
          MarketAddress
        }
        Side {
          Currency {
            Symbol
            Name
            MintAddress
          }
        }
      }
      num_makers: count(distinct: Transaction_Signer)
      num_buyers: count(
        distinct: Transaction_Signer
        if: {Trade: {Side: {Type: {is: buy}}}}
      )
      num_sellers: count(
        distinct: Transaction_Signer
        if: {Trade: {Side: {Type: {is: sell}}}}
      )
      num_trades: count
      traded_volume: sum(of: Trade_Side_AmountInUSD)
      buy_volume: sum(
        of: Trade_Side_AmountInUSD
        if: {Trade: {Side: {Type: {is: buy}}}}
      )
      sell_volume: sum(
        of: Trade_Side_AmountInUSD
        if: {Trade: {Side: {Type: {is: sell}}}}
      )
      num_buys: count(if: {Trade: {Side: {Type: {is: buy}}}})
      num_sells: count(if: {Trade: {Side: {Type: {is: sell}}}})
    }
  }
}
"""

# Top Token Creators on Pump Fun
TOP_TOKEN_CREATORS_PUMPFUN_QUERY= """
query MyQuery {
  Solana(network: solana) {
    Instructions(
      where: {Instruction: {Program: {Name: {is: "pump"}, Method: {is: "create"}}}}
      orderBy: {descendingByField: "tokens_count"}
    ) {
      tokens_count: count
      Transaction {
        Signer
      }
    }
  }
}
"""

# on pumpfun dex
GET_TOP_TRADER_TOKEN_PUMPFUN_DEX_QUERY = """
query TopTraders($token: String, $limit: Int) {
  Solana {
    DEXTradeByTokens(
      orderBy: {descendingByField: "volumeUsd"}
      limit: {count: $limit}
      where: {Trade: {Currency: {MintAddress: {is: $token}}}, Transaction: {Result: {Success: true}}}
    ) {
      Trade {
        Account {
          Owner
        }
        Side {
          Account {
            Address
          }
          Type
        }
      }
      bought: sum(of: Trade_Amount, if: {Trade: {Side: {Type: {is: buy}}}})
      sold: sum(of: Trade_Amount, if: {Trade: {Side: {Type: {is: sell}}}})
      volume: sum(of: Trade_Amount)
      volumeUsd: sum(of: Trade_Side_AmountInUSD)
    }
  }
}
"""

# on multiple dex, return a list of volume of a token on each dex
GET_TRADING_VOLUME_TOKEN_QUERY = """
query MyQuery($token: String!, $since_time: DateTime!) {
  Solana {
    DEXTradeByTokens(
      where: {
        Trade: {
          Currency: {
            MintAddress: { is: $token }
          }
        }
        Block: { Time: { since: $since_time } }
      }
    ) {
      Trade {
        Currency {
          Name
          Symbol
          MintAddress
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
      }
      TradeVolume: sum(of: Trade_Amount)
    }
  }
}
"""


GET_FIST_BUYERS_PUMPFUN_TOKEN_QUERY = """
query MyQuery($token: String!, $limit: Int) {
  Solana {
    DEXTrades(
      where: {
        Trade: {
          Buy: {
            Currency: {
              MintAddress: {
                is: $token
              }
            }
          }
        }
      }
      limit: { count: $limit }
      orderBy: { ascending: Block_Time }
    ) {
      Trade {
        Buy {
          Amount
          Account {
            Token {
              Owner
            }
          }
        }
      }
    }
  }
}
"""

PUMPFUN_TOKEN_LATEST_TRADES_QUERY ="""
query pumpfunTokenLatestTrades($token: String, $limit: Int) {
  Solana {
    DEXTradeByTokens(
      orderBy: {descending: Block_Time}
      limit: {count: $limit}
      where: {
        Trade: {Currency: {MintAddress: {is: $token}}, Price: {gt: 0}
      }, 
        Transaction: {Result: {Success: true}}}
    ) {
      Block {
        allTime: Time
      }
      Trade {
        Account {
          Address
          Owner
        }
        Side {
          Type
          Account {
            Address
            Owner
          }
        }
        Price
        Amount
        Side {
          AmountInUSD
          Amount
        }
      }
    }
  }
}
"""

# ===================== NOT USED =====================
HISTORICAL_PRICE_AND_VOLUME_QUERY="""
query HistoricalPriceAndVolume($token: String!, $since: DateTime!, $interval_in: OLAP_DateTimeIntervalUnits!, $interval_count: Int!) {
  Solana {
    DEXTradeByTokens(
      where: {Trade: {Currency: {MintAddress: {is: $token}}}, Block: {Time: {since: $since}}, Transaction: {Result: {Success: true}}}
      orderBy: {ascending: Block_Time}
    ) {
      Block {
        Timefield: Time(interval: {in: $interval_in, count: $interval_count})
      }
      Trade {
        high: Price(maximum: Trade_Price)
        low: Price(minimum: Trade_Price)
        open: Price(minimum: Block_Time)
        close: Price(maximum: Block_Time)
        PriceInUSD
      }
      volume: sum(of: Trade_Amount)
      volume_in_usd: sum(of: Trade_Side_AmountInUSD)
      
    }
  }
}
"""

TOKEN_CREATION_QUERY="""
query MyQuery($token: String!) {
  Solana(network: solana) {
    Instructions(
      where: {Instruction: {Accounts: {includes: {Address: {is: $token}}}, Program: {Name: {is: "pump"}, Method: {is: "create"}}}}
    ) {
      Block{
        Time
      }
      Transaction {
        Signer
        Signature
      }
      Instruction {
        Accounts {
          Address
        }
      }
    }
  }
}
"""

LAST_N_TRANSACTIONS_QUERY="""
query LastNTransactionsByToken($token: String!, $n: Int!) {
  Solana {
    DEXTradeByTokens(
      where: {Trade: {Dex: {ProtocolName: {is: "pump"}}, Currency: {MintAddress: {is: $token}}}, Transaction: {Result: {Success: true}}}
      orderBy: {ascending: Block_Time}
      limit: {count: $n}
    ) {
      Block {
        Time
      }
      Trade {
        PriceInUSD
        Account {
          Address
          Owner
        }
        Amount
        Price
      }
      volume: sum(of: Trade_Amount)
      volume_in_usd: sum(of: Trade_Side_AmountInUSD)
      Transaction {
        Signature
      }
    }
  }
}
"""
# ===================== NOT USED =====================
