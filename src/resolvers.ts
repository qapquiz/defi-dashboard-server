import { CreamToken, Currency, Resolvers } from './generated.types';
import { bitQueryClient } from './apollo/client';
import { TRACKING_BALANCE } from './apollo/queries';
import { ethers } from "ethers";
import crToken from './abis/crToken.json';

export const resolvers: Resolvers = {
    Query: {
        // TODO [#2]: need to define type of Response query from bitquery.io
        // 
        // Raw response can be found in https://explorer.bitquery.io/graphql/Sr4ksApTAT
        // It should be define in types.ts
        user: async (parent, { id }) => {
            const { loading, error, data } = await bitQueryClient.query({
                query: TRACKING_BALANCE,
                variables: {
                    "limit":10,
                    "offset":0,
                    "network":"bsc",
                    "address": id
                }
            });

            return {
                id: id,
                balances: data.ethereum.address[0].balances.map((balance: any) => {
                    return {
                        id: balance.currency.address,
                        address: balance.currency.address,
                        name: balance.currency.name,
                        symbol: balance.currency.symbol,
                        decimals: balance.currency.decimals,
                        value: balance.value,
                    };
                }),
            };
        },

        venus: async (parent, { address }, { dataSources }) => {
            return {
                userAddress: address,
                totalSupplyBalance: await dataSources.venusAPI.getTotalSupplyBalance(address),
                totalBorrowBalance: await dataSources.venusAPI.getTotalBorrowBalance(address),
                suppliedTokens: await dataSources.venusAPI.getSuppliedTokens(address),
                borrowedTokens: await dataSources.venusAPI.getBorrowedTokens(address),
                vaiMintedAmount: await dataSources.venusAPI.getVAIMintedAmount(address),
                tokens: [],
            };
        },

        cream: async (parent, args, { dataSources }) => {
            return {
                supportTokens: await dataSources.creamFinanceAPI.getSupportTokens()
            };
        },
    },

    VenusToken: {
        id: () => '',
        address: () => '0x',
        name: () => 'TAROZONE',
        symbol: () => 'BNB',
        decimals: () => 18,
        price: () => '2.9',
        logoURI: async (parent, args, { dataSources }) => {
            if (parent.symbol.toUpperCase() == 'BNB') {
                return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png';
            }

            return dataSources.trustWalletAPI.getLogoURI(parent.symbol);
        }
    },

    CreamToken: {
        name: async (parent: CreamToken) => {
            const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
            const contract = new ethers.Contract(parent.address, crToken, provider);
            return contract.name();
        },

        supplyApy: async (parent: CreamToken, args, { dataSources }) => {
            return dataSources.creamFinanceAPI.getSupplyApy(parent.supplyRatePerBlock);
        },

        borrowApy: async (parent: CreamToken, args, { dataSources }) => {
            return dataSources.creamFinanceAPI.getSupplyApy(parent.borrowRatePerBlock);
        },

        logoURI: async (parent, args, { dataSources }) => {
            return null
        }
    },

    User: {
        
    },

    Token: {
        __resolveType(token, context, info) {
            return null;
        }
    },

    Currency: {
        price: async (parent: Currency, args, { dataSources }) => {
            return dataSources.coingeckoAPI.getPrice(parent.symbol);
        },
        
        logoURI: async (parent: Currency, args, { dataSources }) => {
            if (parent.symbol.toUpperCase() == 'BNB') {
                return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png';
            }

            return dataSources.trustWalletAPI.getLogoURI(parent.symbol);
        }
    },
}