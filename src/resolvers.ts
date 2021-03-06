import { CreamToken, Currency, Resolvers } from './generated.types';
import { bitQueryClient } from './apollo/client';
import { TRACKING_BALANCE } from './apollo/queries';
import { ethers } from "ethers";
import crToken from './abis/crToken.json';
import { CustomResolversContext } from './types';

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

        venusProtocol: async (_, __, ctx: CustomResolversContext) => {
            return {
                supportTokens: await ctx.dataSources.venusAPI.getSupportTokens()
            };
        },

        forTubeProtocol: async (_, __, ctx: CustomResolversContext) => {
            return {
                supportTokens: await ctx.dataSources.forTubeAPI.getSupportTokens()
            };
        },

        logoURI: async (_, { symbol }, ctx: CustomResolversContext) => {
            return ctx.dataSources.trustWalletAPI.getLogoURI(symbol.toUpperCase());
        },

        // logoURI: async (_, { (symbol: string) }, ctx: CustomResolversContext) => {
        //     return ctx.dataSources.trustWalletAPI.getLogoURI(symbol.toUpperCase());
        // },
    },

    VenusToken: {
        logoURI: (parent, _, { dataSources }) => {
            if (parent.symbol === 'vBNB')
                return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png';
                
            let symbol = parent.underlyingSymbol || "";
            if (!symbol) {
                return "";
            }
            return dataSources.trustWalletAPI.getLogoURI(symbol);
        }
    },

    ForTubeToken: {
        logoURI: (parent, _, { dataSources }) => {
            if (parent.symbol === 'fBNB')
                return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png';
                
            let symbol = parent.underlyingSymbol || "";
            if (!symbol) {
                return "";
            }
            return dataSources.trustWalletAPI.getLogoURI(symbol);
        }
    },

    CreamToken: {
        name: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            return ctx.dataSources.creamFinanceAPI.getName(parent.address);
        },

        symbol: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            return ctx.dataSources.creamFinanceAPI.getSymbol(parent.address);
        },

        decimals: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            return ctx.dataSources.creamFinanceAPI.getDecimals(parent.address);
        },

        underlyingName: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            if (parent.underlyingAddress == null) {
                return 'Binance Native Token';
            }

            const underlyingContract = new ethers.Contract(parent.underlyingAddress, crToken, ctx.bscProvider);
            return underlyingContract.name();
        },

        underlyingSymbol: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            if (parent.underlyingAddress == null) {
                return 'BNB';
            }

            return parent.symbol.substring(2);
            // const underlyingContract = new ethers.Contract(parent.underlyingAddress, crToken, ctx.bscProvider);
            // return underlyingContract.symbol();
        },

        supplyRatePerBlock: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            const contract = new ethers.Contract(parent.address, crToken, ctx.bscProvider);
            return (await contract.supplyRatePerBlock()).toString();
        },

        borrowRatePerBlock: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            const contract = new ethers.Contract(parent.address, crToken, ctx.bscProvider);
            return (await contract.borrowRatePerBlock()).toString();
        },

        supplyApy: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            const supplyRatePerBlock = await ctx.dataSources.creamFinanceAPI.getSupplyRatePerBlock(parent.address);
            return ctx.dataSources.creamFinanceAPI.getSupplyApy(
                Number(supplyRatePerBlock)
            ).toString();
        },

        borrowApy: async (parent: CreamToken, _, ctx: CustomResolversContext) => {
            const supplyRatePerBlock = await ctx.dataSources.creamFinanceAPI.getBorrowRatePerBlock(parent.address);
            return ctx.dataSources.creamFinanceAPI.getBorrowApy(
                Number(supplyRatePerBlock)
            ).toString();
        },

        logoURI: async (parent, _, { dataSources }) => {
            const underlyingSymbol = parent.symbol.substring(2);

            if (underlyingSymbol == 'BNB') {
                return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png';
            }

            return dataSources.trustWalletAPI.getLogoURI(underlyingSymbol.toUpperCase());
        },
    },

    User: {},

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