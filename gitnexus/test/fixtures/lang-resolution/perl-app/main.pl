#!/usr/bin/env perl

use strict;
use warnings;
use App;
use App::Math;
use App::Utils;

sub main {
    my $app = App->new(x => 10, y => 20);
    my $result = $app->run();
    print "Done: $result\n";
}

main();
