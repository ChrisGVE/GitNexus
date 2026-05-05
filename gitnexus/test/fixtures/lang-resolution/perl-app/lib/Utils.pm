package App::Utils;

use strict;
use warnings;

sub format_result {
    my ($value) = @_;
    return sprintf("%.2f", $value);
}

sub is_valid {
    my ($value) = @_;
    return defined($value) && $value >= 0;
}

1;
