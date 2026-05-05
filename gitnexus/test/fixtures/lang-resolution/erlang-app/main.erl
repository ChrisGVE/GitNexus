-module(main).
-behaviour(gen_server).

-export([start/0, main/0]).

start() ->
    {ok, _Pid} = gen_server:start_link({local, ?MODULE}, ?MODULE, [], []),
    ok.

main() ->
    Result = math_utils:add(1, 2),
    Greeting = string_utils:greet("World"),
    io:format("~p ~s~n", [Result, Greeting]),
    ok.

init([]) ->
    {ok, #{}}.

handle_call(_Request, _From, State) ->
    {reply, ok, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.
